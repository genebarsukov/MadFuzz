<?php
/**
 * Created by PhpStorm.
 * User: Gene
 * Date: 1/7/2017
 * Time: 11:50 PM
 */

class AssetController {
   private $db_conn = null;

   /**
    * AssetController constructor.
    * @param $db_conn: DBConnector object
    */
   function __construct($db_conn) {
      $this->db_conn = $db_conn;
   }

   /**
    * Performs the action sent from the front end
    * @param $action : String: tells what to do
    * @param $params : Dict: needed to perform the action in some cases
    * @return array|int|string: Response array
    */
   function performAction($action, $params) {
      $response = '';

      switch($action) {

         case 'get_top_stories':
            $response = $this->getTopStories($params['user_id']);
            break;

         case 'get_user_id':
            $response = $this->getUserId($params['ip']);
            break;

         case 'update_story_rating':
            $response = $this->updateStoryRating($params['user_id'], $params['story_id'], 
               $params['rating_action'], $params['vote_text'], $params['rand_mod']);
            break;

         case 'get_auto_complete_items':
            $response = $this->getAutoCompleteItems($params['search_string']);
            break;

         case 'get_search_results':
            $response = $this->getSearchResults($params['search_string'], $params['story_id'], $params['user_id']);
            break;

         default:
            $response = 'Unrecognized Action';
            break;
      }

      return $response;
   }

   /**
    * Gets and returns all the top stories on page load
    * @param $user_id: User id of the current user: Used to get the user's story ratings
    * @return array
    */
   function getTopStories($user_id) {
      $story_display_limit = Config::$story_display_limit;

      $query = "SELECT def.story_id,
                       def.url,
                       def.title,
                       def.author,
                       lss.summary as snippet,
                       def.source_id,
                       def.active,
                       def.position,
                       def.rating,
                       def.up_votes,
                       def.down_votes,
                       def.rand_mod,
                       def.date_created,
                       def.date_updated,
                       lkp.last_rating_action,
                       lkp.vote_text,
                       ds.name as source
                FROM DEF_STORY def
                  INNER JOIN LKP_STORY_SUMMARY lss USING(story_id)
                  LEFT JOIN LKP_USER_STORY lkp ON(def.story_id = lkp.story_id AND lkp.user_id = {$user_id})
                  LEFT JOIN DEF_SOURCE ds USING(source_id)
                WHERE def.active = 'y'
                  ORDER BY def.position DESC
                  LIMIT $story_display_limit";

      $result = $this->db_conn->getResultArray($query);

      return ['data' => $result];
   }

   /**
    * Gets and returns a user id based on the user ip on page load
    * Creates a new id if one does not exist
    * Returns an id of 0 id the ip is blank or null
    * @param ip : current client ip address
    * @return array: Response array
    */
   function getUserId($ip) {
      $response = ['user_id' => 0];

      if ($ip == null) {
         return $response;
      }

      $escaped_ip  = $this->db_conn->escape($ip);
      $query = "SELECT user_id FROM DEF_USER WHERE ip = '{$escaped_ip}'";

      $result = $this->db_conn->getResultRow($query);

      if ($result) {
         $response['user_id'] = $result['user_id'];
      } else {
         $query = "INSERT INTO DEF_USER SET ip = '{$escaped_ip}'";
         $result = $this->db_conn->query($query);
         if ($result == null) {
            return $response;
         } else {
            $response['user_id'] = (string) $this->db_conn->lastInsertId();
         }
      }

      return $response;
   }

   /**
    * Decide whether or not to update the story rating based on the current story rating action and whether or not the
    * this current user has already performed this same action in the past
    * Prevents refreshing and updating again
    * @param $user_id : Id of user based on ip
    * @param $story_id : Id of story we want to update
    * @param $rating_action : What kind of action we want to perform (up_vote / down_vote)
    * @return array: Response array
    */
   function updateStoryRating($user_id, $story_id, $rating_action, $vote_text, $rand_mod) {
      $response = ['updated' => false];

      $rating_divider = Config::$rating_divider;
      $rating_modifier = Config::$rating_modifier;
      $time_divider = Config::$time_divider;
      $time_modifier = Config::$time_modifier;
      # We need the same random modifier to be used when updating the story multiple times.
      # This is why we save it during scanning, then load it and pass it here
      $random_modifier = $rand_mod;

      $formula_1 = ", position = ((720 - TIME_TO_SEC(TIMEDIFF(NOW(), date_created ))/3600) 
                                             + {$random_modifier})
                                             * ((rating + {$rating_modifier}) / {$rating_divider})";

      $formula_2 = ", position = CEIL(((720 - TIME_TO_SEC(TIMEDIFF(NOW(), date_created ))/3600) + $time_modifier) / $time_divider
                                             * ((rating + {$rating_modifier}) / {$rating_divider})
                                             + {$random_modifier})";

      $position_calc_clause = $formula_2;
      // return if unable to get user id for ip previously
      if ($user_id == 0) {
         return $response;
      }
      $escaped_user_id  = $this->db_conn->escape($user_id);
      $escaped_story_id  = $this->db_conn->escape($story_id);
      $escaped_rating_action  = $this->db_conn->escape($rating_action);
      $escaped_vote_text  = $this->db_conn->escape($vote_text);

      $query = "SELECT last_rating_action, vote_text
                  FROM LKP_USER_STORY
                WHERE user_id = $escaped_user_id
                  AND story_id = $escaped_story_id";

      $result = $this->db_conn->getResultRow($query);
      // if no record exists for this story, create one and update DEF_STORY
      if ($result == null) {
         $lkp_query = "INSERT INTO LKP_USER_STORY 
                           SET user_id = '{$escaped_user_id}',
                               story_id = '{$escaped_story_id}',
                               last_rating_action = '{$escaped_rating_action}',
                               vote_text = '{$escaped_vote_text}'";

         $this->db_conn->query($lkp_query);

         if ($escaped_rating_action == 'up_vote') {
            $update_clause = "SET up_votes = up_votes + 1,
                                  rating = CEIL(100 * (up_votes / IF((up_votes + down_votes)=0, 1, up_votes + down_votes)))";
         } else if ($escaped_rating_action == 'down_vote') {
            $update_clause = "SET down_votes = down_votes + 1,
                                  rating = CEIL(100 * (up_votes / IF((up_votes + down_votes)=0, 1, up_votes + down_votes)))";
         }
         // SET {$escaped_rating_action}s = {$escaped_rating_action}s + 1


         $def_query = "UPDATE DEF_STORY 
                          {$update_clause}{$position_calc_clause}
                       WHERE story_id = '{$escaped_story_id}'";

         $this->db_conn->query($def_query);

         $response['updated'] = true;
      } // if unrecognized rating action, return
      else if($escaped_rating_action != 'up_vote' && $escaped_rating_action != 'down_vote') {
         return $response;
      } // decide whether or not to update based on last and current actions
      else {
         // if actions are equal, update only the vote_text
         if ($result['last_rating_action'] == $escaped_rating_action) {
            // if vote_texts are equal, don't updated, return
            if ($result['vote_text'] == $escaped_vote_text) {
               return $response;
            }
            $lkp_query = "UPDATE LKP_USER_STORY 
                             SET vote_text = '{$escaped_vote_text}'
                          WHERE user_id = '{$escaped_user_id}'
                            AND story_id = '{$escaped_story_id}'";

            $this->db_conn->query($lkp_query);

            $response['updated'] = true;

         } // update LKP_USER_STORY and DEF_STORY
         else {
            $lkp_query = "UPDATE LKP_USER_STORY 
                             SET last_rating_action = '{$escaped_rating_action}',
                                 vote_text = '{$escaped_vote_text}'
                          WHERE user_id = '{$escaped_user_id}'
                            AND story_id = '{$escaped_story_id}'";
            
            $this->db_conn->query($lkp_query);

            if ($result['last_rating_action'] == 'none') {
               if ($escaped_rating_action == 'up_vote') {
                  $update_clause = "SET up_votes = up_votes + 1,
                                  rating = CEIL(100 * (up_votes / IF((up_votes + down_votes)=0, 1, up_votes + down_votes)))";
               } else if ($escaped_rating_action == 'down_vote') {
                  $update_clause = "SET down_votes = down_votes + 1,
                                  rating = CEIL(100 * (up_votes / IF((up_votes + down_votes)=0, 1, up_votes + down_votes)))";
               }
            }
            else if($result['last_rating_action'] == 'up_vote') {
               if ($escaped_rating_action == 'down_vote') {
                  $update_clause = "SET down_votes = down_votes + 1,
                                     up_votes = IF(up_votes = 0, 0, up_votes - 1),
                                     rating = CEIL(100 * (up_votes / IF((up_votes + down_votes)=0, 1, up_votes + down_votes)))";
               }
            }
            else if($result['last_rating_action'] == 'down_vote') {
               if ($escaped_rating_action == 'up_vote') {
                  $update_clause = "SET up_votes = up_votes + 1,
                                     down_votes = IF(down_votes = 0, 0, down_votes - 1),
                                     rating = CEIL(100 * (up_votes / IF((up_votes + down_votes)=0, 1, up_votes + down_votes)))";
               }
            }

            $def_query = "UPDATE DEF_STORY 
                              {$update_clause}{$position_calc_clause}
                       WHERE story_id = '{$escaped_story_id}'";

            $this->db_conn->query($def_query);

            $response['updated'] = true;
         }
      }
      # Select the record we just updated so that we can send its updated position to te front end
      $query = "SELECT * 
                  FROM DEF_STORY def
                    INNER JOIN LKP_USER_STORY lkp USING(story_id)
                  WHERE def.story_id = $story_id
                    AND lkp.user_id = {$escaped_user_id}";

      $update_result = $this->db_conn->getResultRow($query);

      $response['story'] = $update_result;

      return $response;
   }

   /**
    * Get a list of story titles for the auto-complete search box
    * The returned response is a keyed list of story title-id pairs
    */
   function getAutoCompleteItems($search_string) {
      $response = ['items' => []];

      $search_string = $this->db_conn->escape($search_string);

      $search_statement = " title LIKE '%{$search_string}%'";
      if (strlen($search_string) < 2) {
         $search_statement = " title LIKE '{$search_string}%'";
      }
      $limit = Config::$story_display_limit;
      $query = "SELECT story_id, title 
                FROM DEF_STORY 
                WHERE $search_statement
                  ORDER BY date_created, date_updated DESC
                  LIMIT $limit";
      
      $result = $this->db_conn->getResultArray($query);

      $response['items'] = $result;

      return $response;
   }

   /**
    * Get the full search result set once the search string had been finalized
    * This is done so that we do not have to retrieve a full set of story data every time the input changes
    * @param $search_string: Full search string representing a story title
    * @param $story_id: The story id associated with the title
    * @param $user_id: current users id
    * @return array: A list of stories
    */
   function getSearchResults($search_string, $story_id, $user_id) {
      $story_display_limit = Config::$story_display_limit;

      $search_string = $this->db_conn->escape($search_string);
      $story_id = $this->db_conn->escape($story_id);
      if ($story_id) {
         $search_statement = " def.story_id = $story_id";
      } else {
         $search_statement = " title LIKE '%{$search_string}%'";
         if (strlen($search_string) < 2) {
            $search_statement = " title LIKE '{$search_string}%'";
         }
      }
      
      $query = "SELECT def.story_id,
                       def.url,
                       def.title,
                       def.author,
                       lss.summary as snippet,
                       def.source_id,
                       def.active,
                       def.position,
                       def.rating,
                       def.up_votes,
                       def.down_votes,
                       def.rand_mod,
                       def.date_created,
                       def.date_updated,
                       lkp.last_rating_action,
                       lkp.vote_text,
                       ds.name as source
                FROM DEF_STORY def
                  INNER JOIN LKP_STORY_SUMMARY lss USING(story_id)
                  LEFT JOIN LKP_USER_STORY lkp ON(def.story_id = lkp.story_id AND lkp.user_id = {$user_id})
                  LEFT JOIN DEF_SOURCE ds USING(source_id)
                WHERE $search_statement
                  ORDER BY date_created, date_updated DESC
                  LIMIT $story_display_limit";

      $result = $this->db_conn->getResultArray($query);

      return ['items' => $result];
   }

   /**
    * Escapes special string characters that mess up json encoding
    * @param $value
    * @return mixed
    */
   function escapeJsonString($value) { # list from www.json.org: (\b backspace, \f formfeed)
      $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
      $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
      $result = str_replace($escapers, $replacements, $value);

      $result = preg_replace('/[[:^print:]]/', '', $result);

      return $result;
   }
   
}