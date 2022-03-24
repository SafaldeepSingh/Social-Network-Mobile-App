<?php
use Restserver\Libraries\REST_Controller;
if (!defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');

// Load the Rest Controller library
require APPPATH . 'libraries/REST_Controller.php';
require APPPATH . 'libraries/Format.php';


class Posts extends REST_Controller {

    public function __construct() { 
        parent::__construct();
        
        // Load the user model
        $this->load->model('post');
        $this->load->model('likes');
        $this->load->model('notifications');
         $this->load->helper('jwt');
         $this->load->helper('file_upload');
        $this->load->model('keys/jwt_token_model','jwtModel');
     
        
    }

    public function add_post(){

    	 $jwt=$this->input->get_request_header('Authorizations');
        
        if($jwt)
        {

        	$id=$this->post('id');

        

        	 $data=validateJWT($id,$jwt);


            if($data)
            {
            	 if((int)$id==(int)$data->id)
                {
                	$userData['post_title']=strip_tags($this->post('title'));
                	$userData['post_content']=strip_tags($this->post('content'));
                	$userData['post_status']='publish';
                	$userData['comment_status']='open';
                	$userData['comment_count']=0;
                	$userData['user_id']=$id;

                	 $insert = $this->post->insert($userData);

                	 if($insert)
                	 {
                	 	 $responseData['post'] = $insert;
					//upload images
					if(isset($_FILES['post_attachment']) && $_FILES['post_attachment']['size'] > 0)
					{

					
						$config=getPostAttachmentConfig($insert['post_id'],$id);
							if(isset($this->upload)) {$this->upload->initialize($config);}
        				else {$this->load->library('upload', $config);}

        					$name_array = array();
       						$count = count($_FILES['post_attachment']['name']);
        					$files=$_FILES;
        					$uploadStatus=true;

        					//upload start
        					for($s=0; $s<=$count-1; $s++) {
        					$_FILES['post_attachment']['name']=$files['post_attachment']['name'][$s];
        					$_FILES['post_attachment']['type']    = $files['post_attachment']['type'][$s];
        					$_FILES['post_attachment']['tmp_name'] = $files['post_attachment']['tmp_name'][$s];
        					$_FILES['post_attachment']['error']     = $files['post_attachment']['error'][$s];
        					$_FILES['post_attachment']['size']    = $files['post_attachment']['size'][$s]; 
                            // echo '<pre>';
                            // print_r($_FILES);
                            // // exit;
                            

           			            
       						 if($this->upload->do_upload('post_attachment'))
       						 {
       						 	 $data = $this->upload->data();

      						 $name_array[] = base_url().'sf-content/posts/'.md5($id).'/'.md5($insert['post_id']).'/postattachment/'.$data['file_name'];
       						 }
       						 else
       						 {

       						 	delete_files('./sf-content/posts/'.md5($id).'/'.md5($insert).'/postattachment/');
       						 	$this->post->delete($insert);
       						 	$uploadStatus=false;
            //                 echo '<pre>';
            //                 print_r($this->upload->display_errors('<p>', '</p>'));
            //                 exit;
       						 	break; 

       						 }

           				 }
           				 //upload finish

           				 if(!$uploadStatus)
           				 {
								$this->response("Some problem occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
           				 }
           				 else
           				 {
           				 	$saveData = array();

           				 	foreach($name_array as $row)
           				 	{
           				 		$entry=array(
           				 			'postid'=> $insert['post_id'],
           				 			'attachment'=>$row
           				 		);

           				 		$saveData[]=$entry;
           				 	}
                            $responseData['post']['attachments']=$saveData;
           				 
           				 	$this->post->saveImages($saveData);
           				 }
					}
                	 	 $this->response([
                        'status' => TRUE,
                        'message' => 'The post has been added successfully.',
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
                	$this->response("Some problem occurred with the token, please try again.", REST_Controller::HTTP_BAD_REQUEST);
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


    public function getuserpost_post()
    {

    	$jwt=$this->input->get_request_header('Authorizations');
        
        if($jwt)
        {

        	$id=$this->post('id');
        	$userId=$this->post('user_id');


        	 $data=validateJWT($id,$jwt);

            if($data)
            {

            	 if((int)$id==(int)$data->id)
                {
                	$postdata=$this->post->getall($userId, true, $id);
                	if($postdata['result'])
                	{
                		 $this->response([
                        'status' => TRUE,
                        'data' => $postdata['result'],
                        'followers' => $postdata['followers'],
                        'followings' => $postdata['followings'],
                    ], REST_Controller::HTTP_OK);
                	}
                	else{
                	     $this->response([
                        'status' => FALSE,
                        'data' => 'NO_POST_FOUND',
                        'followers' => $postdata['followers'],
                        'followings' => $postdata['followings'],
                    ], REST_Controller::HTTP_OK);
                	}


                }
                else
                {
                	$this->response(array('status'=>'Forbidden, Some issue with the token'), REST_Controller::HTTP_UNAUTHORIZED);
                }
            }
            else
            {
            	$this->response(array('status'=>'Forbidden1'), REST_Controller::HTTP_UNAUTHORIZED);
            }
        }
         else
            {
            	  $this->response(array('status'=>'Forbidden2'), REST_Controller::HTTP_UNAUTHORIZED);
            }

    }
    public function getallpost_post()
    {

    	$jwt=$this->input->get_request_header('Authorizations');
        
        if($jwt)
        {

        	$id=$this->post('id');


        	 $data=validateJWT($id,$jwt);
                // print_r('data');
                // print_r($data);
                // exit;
            if($data)
            {
            	 if((int)$id==(int)$data->id)
                {
                	$postdata=$this->post->getall($id, false, $id);
                	if($postdata['result'])
                	{
                		 $this->response([
                        'status' => TRUE,
                        'data' => $postdata['result']
                    ], REST_Controller::HTTP_OK);
                	}
                	else{
                	     $this->response([
                        'status' => FALSE,
                        'data' => 'NO_POST_FOUND'
                    ], REST_Controller::HTTP_OK);
                	}


                }
                else
                {
                	$this->response(array('status'=>'Forbidden, Some issue with the token'), REST_Controller::HTTP_UNAUTHORIZED);
                }
            }
            else
            {
            	$this->response(array('status'=>'Forbidden1'), REST_Controller::HTTP_UNAUTHORIZED);
            }
        }
         else
            {
            	  $this->response(array('status'=>'Forbidden2'), REST_Controller::HTTP_UNAUTHORIZED);
            }

    }

    public function delete_post()
    {

    	$jwt=$this->input->get_request_header('Authorizations');
        
        if($jwt)
        {

        	$id=$this->post('id');
        	$post_id=$this->post('postid');

        

        	 $data=validateJWT($id,$jwt);


            if($data)
            {

            	 if((int)$id==(int)$data->id)
                {
                	$postdata=$this->post->deletePost($id,$post_id);


                	if($postdata)
                	{
                		 $this->response([
                        'status' => TRUE,
                        'message'=> 'Your post has been deleted successfully'
                    ], REST_Controller::HTTP_OK);
                	}
                	else
                	{
                		 $this->response("Some problem occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
                	}


                }
                else
                {
                	$this->response(array('status'=>'Forbidden, Some issue with the token'), REST_Controller::HTTP_UNAUTHORIZED);
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

    public function update_put()
    {

    	$jwt=$this->input->get_request_header('Authorizations');
        
 		if($jwt)
        {

    	 $id = $this->put('id');
    	 $postid=$this->put('postid');
    	 $data=validateJWT($id,$jwt);

    	 if($data){
    	 
    	 	 if((int)$id==(int)$data->id)
                {
                	$postTitle=strip_tags($this->put('title'));
                	$postContent=strip_tags($this->put('content'));

                	if(!empty($id) && !empty($postid) && (!empty($postTitle) || !empty($postContent)))
                	{
                		 $userData = array();
					    if(!empty($postTitle)){
					        $userData['post_title'] = $postTitle;
					    }
					    if(!empty($postContent)){
					        $userData['post_content'] = $postContent;
					    }


					    $result=$this->post->update($id,$postid,$userData);

					    $userData['post_id']=$postid;


					    if($result)
					    {
					    	 $this->response([
                        'status' => TRUE,
                        'data' => $userData,
                        'message'=> 'Your post has been updated successfully'
                    ], REST_Controller::HTTP_OK);
					    }
					    else
					    {
					    	$this->response("Some problem occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
					    }


                	}
                	else
                	{
                		 $this->response("Data sent is invalid", REST_Controller::HTTP_BAD_REQUEST);
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
    		$this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
    	}


    }

public function share_post()
    {

    	$jwt=$this->input->get_request_header('Authorizations');
        
        if($jwt)
        {
        	$id=$this->post('id');
        	$userId=$this->post('user_id');
        	$data=validateJWT($id,$jwt);
            if($data)
            {
            	 if((int)$id==(int)$data->id)
                {
                    $data = array(
                        'share_post_id' => $this->post('share_post_id'),
                        'post_content'=> $this->post('share_content'),
                        'comment_status' => 'open',
                        'user_id' => $id
                        );
                	$insert=$this->post->insert($data);
                	if($insert)
                	{
                	    //add notification to user
                            $data = array('user' => $id,'type' =>'sharePost','post_id' => $data['share_post_id'],'seen' => '0', 'created_date' => date("Y-m-d H:i:s"));                	        
                            $this->notifications->add($data);

                		 $this->response([
                        'status' => TRUE,
                        'post' => $insert,
                        'message' => 'Post Shared Successfully'
                    ], REST_Controller::HTTP_OK);
                	}
                	else{
                	     $this->response([
                        'status' => FALSE,
                        'message' => 'Some Problem Occurred'
                    ], REST_Controller::HTTP_OK);
                	}


                }
                else
                {
                	$this->response(array('status'=>'Forbidden, Some issue with the token'), REST_Controller::HTTP_UNAUTHORIZED);
                }
            }
            else
            {
            	$this->response(array('status'=>'Forbidden1'), REST_Controller::HTTP_UNAUTHORIZED);
            }
        }
         else
            {
            	  $this->response(array('status'=>'Forbidden2'), REST_Controller::HTTP_UNAUTHORIZED);
            }

    }


}
