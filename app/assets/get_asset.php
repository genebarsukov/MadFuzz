<?php
/**
 * Created by PhpStorm.
 * User: Gene
 * Date: 12/11/2016
 * Time: 6:47 AM
 */
include dirname(__FILE__) . '/asset_loader.php';

$db_conn = new DBConnector(Config::$db_host, Config::$db_user, Config::$db_password, Config::$db_database);

$action = $_REQUEST['action'];
$params = $_REQUEST['params'];

if ($params) {
   $params = json_decode($params, true);
   $params['ip'] = $_SERVER['REMOTE_ADDR'];
} else {
   $params = ['ip' => $_SERVER['REMOTE_ADDR']];
}

$controller = new AssetController($db_conn);
$response = $controller->performAction($action, $params);

echo json_encode($response);