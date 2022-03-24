<?php
use Restserver\Libraries\REST_Controller;
if (!defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');

// Load the Rest Controller library
require APPPATH . 'libraries/REST_Controller.php';
require APPPATH . 'libraries/Format.php';


class Comments extends REST_Controller {

    public function __construct() { 
        parent::__construct();
        
        // Load the user model
        $this->load->model('comment');
        $this->load->model('notifications');
          $this->load->model('post');
         $this->load->helper('jwt');
         $this->load->helper('file_upload');
        $this->load->model('keys/jwt_token_model','jwtModel');
        
    }

    public function add_post()
    {
    	 $jwt=$this->input->get_request_header('Authorizations');

    	 if($jwt)
        {

        	$id=$this->post('user_id');
        	$data=validateJWT($id,$jwt);

        	 if($data)
            {
            	 if((int)$id==(int)$data->id)
                {
                	$userData['comment_text']=strip_tags($this->post('comment'));

                	$parent=strip_tags($this->post('parent_comment'));

                // 	if(!empty($parent))
                // 	{
						$userData['parent']=$parent;                		
                // 	}
                // 	else
                // 	{
                // 	$userData['parent']=0;                			
                // 	}

                	$userData['user_id']=$id;
                	$userData['post']=strip_tags($this->post('post_id'));

                	$insert = $this->comment->insert($userData);

                	if($insert)
                	{
                		$this->post->updateCommentCount($userData['post']);	
                		 $responseData['comment_id'] = $insert;
                        if(!$parent) {
                            $data = array('user' => $id,'type' =>'commentPost','comment_id' => $insert,'seen' => '0', 'created_date' => date("Y-m-d H:i:s"));                	        
                            $this->notifications->add($data);
                        }

                		  $this->response([
                        'status' => TRUE,
                        'message' => 'The comment has been added successfully.',
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

    public function fetch_comments_post()
    {
        $jwt=$this->input->get_request_header('Authorizations');

        if($jwt){
            $id=$this->post('user_id');
            $data=validateJWT($id,$jwt);

            if($data)
            {
                if((int)$id==(int)$data->id){
                    $userData['post']=strip_tags($this->post('post_id'));
                    $commentQuery=$this->comment->getByPost($userData['post'], $id);
                
                if($commentQuery)
                {
                    $commentsArray=[];
                    $commentsArray['parent']=[];
                    $commentsArray['child']=[];

                foreach($commentQuery as $comment)
                {
                    if((int)$comment['parent']==0)
                    {
                        array_push($commentsArray['parent'],$comment);           
                    }
                    else
                    {
                        array_push($commentsArray['child'],$comment);   
                    }
                }

                    $result=$commentsArray; 
                     $this->response([
                        'status' => TRUE,
                        'message' => 'Comments Fetched Successfully',
                        'data' => $result
                    ], REST_Controller::HTTP_OK);
                }
                else
                {
                      $this->response([
                        'status' => TRUE,
                        'message' => 'Comments Fetched Successfully',
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

    public function like_post()
    {
    	 $jwt=$this->input->get_request_header('Authorizations');

    	 if($jwt)
        {

        	$id=$this->post('user');
        	$data=validateJWT($id,$jwt);

        	 if($data)
            {
            	 if((int)$id==(int)$data->id)
                {
                	$comment_id=$this->post('comment');
                	$queryData['user'] = $id;
                	$queryData['comment'] = $comment_id;
                	$message=$this->comment->toggleLike($queryData);
                	if($message) {
                	    if($message == 'Liked Successfully') {
                	       $data = array('user' => $id,'type' =>'likeComment','comment_id' => $comment_id,'seen' => '0', 'created_date' => date("Y-m-d H:i:s"));                	        
                            $this->notifications->add($data);
                        	$this->response([
                                'status' => TRUE,
                                'message' => $message,
                            ], REST_Controller::HTTP_OK);
                	    } else {
                	        $data = array('user' => $id,'type' =>'likeComment','comment_id' => $comment_id);                	        
                            $this->notifications->remove($data);
                        	$this->response([
                                'status' => TRUE,
                                'message' => $message,
                            ], REST_Controller::HTTP_OK);

                	    }
                	}
                	else {
                     	$this->response([
                                'status' => FALSE,
                                'message' => $message,
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

}