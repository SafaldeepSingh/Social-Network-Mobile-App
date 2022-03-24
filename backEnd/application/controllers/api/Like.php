<?php
use Restserver\Libraries\REST_Controller;
if (!defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');

// Load the Rest Controller library
require APPPATH . 'libraries/REST_Controller.php';
require APPPATH . 'libraries/Format.php';


class Like extends REST_Controller {

	public function __construct() { 
        parent::__construct();
        
        // Load the user model
        $this->load->model('user');
        $this->load->model('notifications');
        $this->load->model('likes');
          $this->load->model('post');
         $this->load->helper('jwt');
        $this->load->model('keys/jwt_token_model','jwtModel');
    }

    public function add_post()
    {
    	$jwt=$this->input->get_request_header('Authorizations');

    	if($jwt){
    		$id=$this->post('user_id');

        	$data=validateJWT($id,$jwt);

        	if($data)
        	{
        		 if((int)$id==(int)$data->id){
        		 	$userData['post']=strip_tags($this->post('post_id'));
        		 	$userData['user']=$id;
        		 	$status = $this->likes->toggleStatus($userData);
        		 	if($status)
                	{
                	    if($status=='Liked Successfully') {
                		$count=$this->post->updateLikeCount($userData['post'], 'plus');
                        if($id != $this->post('post_user_id')) {
                            $data = array('user' => $id,'type' =>'likePost','post_id' => $userData['post'],'seen' => '0', 'created_date' => date("Y-m-d H:i:s"));                	        
                            $this->notifications->add($data);
                        }
                	    }
                		else{
                		$count=$this->post->updateLikeCount($userData['post'], 'minus');
                		if($id != $this->post('post_user_id')) {
                            $data = array('user' => $id,'type' =>'likePost','post_id' => $userData['post']);                	        
                            $this->notifications->remove($data);
                        }
                		}
                		if($count)
                		{
                			$responseData['like_count'] = $count;	
                		}
                		$responseData['post_id']=$userData['post'];
                // 		$responseData['latest_like_id'] = $insert;
                		 $this->response([
                        'status' => TRUE,
                        'message' => $status,
                        'data' => $responseData
                    ], REST_Controller::HTTP_OK);
                	}
                	else
                	{
                		$this->response("Some problem occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
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

    public function fetch_likes_post()
    {
    	$jwt=$this->input->get_request_header('Authorizations');

    	if($jwt){
    		$id=$this->post('user_id');
    		$data=validateJWT($id,$jwt);

    		if($data)
    		{
    			if((int)$id==(int)$data->id){
    				$userData['post']=strip_tags($this->post('post_id'));
    				$likes=$this->likes->getAll($userData['post'], $id);
    				if($likes)
    				{
    					 $this->response([
                        'status' => TRUE,
                        'message' => 'success',
                        'data' => $likes
                    ], REST_Controller::HTTP_OK);
    				}
    				else
    				{
    					 $this->response([
                        'status' => TRUE,
                        'message' => 'success',
                        'data' => '0'
                    ], REST_Controller::HTTP_OK);
    				}
    			}
    			else
    			{
    				$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);		
    			}
    		}
    		else
    		{$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);

    		}
    	}
    	else
    	{
    		$this->response(array('status'=>'Forbidden, No JWT present'), REST_Controller::HTTP_UNAUTHORIZED);

    	}
    }

}
?>