<?php
use Restserver\Libraries\REST_Controller;
if (!defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');

// Load the Rest Controller library
require APPPATH . 'libraries/REST_Controller.php';
require APPPATH . 'libraries/Format.php';


class Notification extends REST_Controller {

    public function __construct() { 
        parent::__construct();
        
        // Load the user model
        $this->load->model('post');
        $this->load->model('notifications');
         $this->load->helper('jwt');
         $this->load->helper('file_upload');
        $this->load->model('keys/jwt_token_model','jwtModel');
     
        
    }
    public function confirmFollowRequest_post() {
 	$jwt=$this->input->get_request_header('Authorizations');

    	if($jwt){
    		$id=$this->post('user_id');

        	$data=validateJWT($id,$jwt);

        	if($data)
        	{
        		 if((int)$id==(int)$data->id){
        		    $follower_id= $this->post('follower_id');
                    $status = $this->notifications->confirmFollowRequest($id, $follower_id);
                    if($status) {
                		 $this->response([
                        'status' => TRUE,
                        'message' => 'Request Confirmed'
                    ], REST_Controller::HTTP_OK);
                    }
                    else {
            		 $this->response([
                        'status' => FALSE,
                        'message' => 'Something Went wrong'
                    ], REST_Controller::HTTP_OK);

                    }
        		 }
        		 else
        		 {
        		 	$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        		 }
        	}
        	else
        	{
        		$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        	}
    	}
    	else
    	{
    		$this->response(array('status'=>'Forbidden, No JWT present'), REST_Controller::HTTP_UNAUTHORIZED);
    	}    
        
    }
    public function deleteFollowRequest_post() {
 	$jwt=$this->input->get_request_header('Authorizations');

    	if($jwt){
    		$id=$this->post('user_id');

        	$data=validateJWT($id,$jwt);

        	if($data)
        	{
        		 if((int)$id==(int)$data->id){
        		    $follower_id= $this->post('follower_id');
                    $status = $this->notifications->deleteFollowRequest($id, $follower_id);
                    if($status) {
                		 $this->response([
                        'status' => TRUE,
                        'message' => 'Request Confirmed'
                    ], REST_Controller::HTTP_OK);
                    }
                    else {
            		 $this->response([
                        'status' => FALSE,
                        'message' => 'Something Went wrong'
                    ], REST_Controller::HTTP_OK);

                    }
        		 }
        		 else
        		 {
        		 	$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        		 }
        	}
        	else
        	{
        		$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        	}
    	}
    	else
    	{
    		$this->response(array('status'=>'Forbidden, No JWT present'), REST_Controller::HTTP_UNAUTHORIZED);
    	}    
        
    }    

    public function getNotificationsCount_post() {
 	$jwt=$this->input->get_request_header('Authorizations');

    	if($jwt){
    		$id=$this->post('user_id');

        	$data=validateJWT($id,$jwt);

        	if($data)
        	{
        		 if((int)$id==(int)$data->id){
                    $count = $this->notifications->getCount($id);
                		 $this->response([
                        'status' => TRUE,
                        'count' => $count
                    ], REST_Controller::HTTP_OK);
        		 }
        		 else
        		 {
        		 	$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        		 }
        	}
        	else
        	{
        		$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        	}
    	}
    	else
    	{
    		$this->response(array('status'=>'Forbidden, No JWT present'), REST_Controller::HTTP_UNAUTHORIZED);
    	}    }    
    

    public function getNotifications_post() {
 	$jwt=$this->input->get_request_header('Authorizations');

    	if($jwt){
    		$id=$this->post('user_id');

        	$data=validateJWT($id,$jwt);

        	if($data)
        	{
        		 if((int)$id==(int)$data->id){
                    $notifications = $this->notifications->get($id);
                	if($notifications) {
                		 $this->response([
                        'status' => TRUE,
                        'data' => $notifications
                    ], REST_Controller::HTTP_OK);
                	   
                	}
                	else {
                		 $this->response([
                        'status' => FALSE,
                        'data' => 0
                    ], REST_Controller::HTTP_OK);
                	}
        		 }
        		 else
        		 {
        		 	$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        		 }
        	}
        	else
        	{
        		$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
        	}
    	}
    	else
    	{
    		$this->response(array('status'=>'Forbidden, No JWT present'), REST_Controller::HTTP_UNAUTHORIZED);
    	}    }    

}