<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function getPostAttachmentConfig($insert,$id)
{

$path='./sf-content/posts/'.md5($id).'/'.md5($insert).'/postattachment/';

	if (!file_exists($path)) {
		mkdir($path, 0777, true);
	}

	$config['upload_path'] = $path;
	$config['allowed_types'] = 'gif|jpg|png|jpeg';
	$config['max_size'] = '200000';
	$config['overwrite'] = FALSE;
	$config['encrypt_name']= TRUE;

	return $config;

}
function getUserProfileConfig($userid)
{
$path='./sf-content/users/'.md5($userid).'/'.'/profilepicture/';

	if (!file_exists($path)) {
		mkdir($path, 0777, true);
	}

	$config['upload_path'] = $path;
	$config['allowed_types'] = 'gif|jpg|png|jpeg';
	$config['max_size'] = '2000';
	$config['overwrite'] = FALSE;
	$config['encrypt_name']= TRUE;

	return $config;
}


?>