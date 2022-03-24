<?php
use Restserver\Libraries\REST_Controller;
if (!defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');

// Load the Rest Controller library
require APPPATH . 'libraries/REST_Controller.php';
require APPPATH . 'libraries/Format.php';


class Users extends REST_Controller {

    public function __construct() { 
        parent::__construct();
        
        // Load the user model
        $this->load->model('user');
         $this->load->helper('jwt');
        $this->load->model('keys/jwt_token_model','jwtModel');
          $this->load->helper('file_upload');
        
    }
    
  
    public function detail_get($id = 0) {
        // Returns all the users data if the id not specified,
        // Otherwise, a single user will be returned.
        $con = $id?array('id' => $id):'';
        $users = $this->user->getRows($con);
        
        // Check if the user data exists
        if(!empty($users)){
            // Set the response and exit
            //OK (200) being the HTTP response code
            $this->response($users, REST_Controller::HTTP_OK);
        }else{
            // Set the response and exit
            //NOT_FOUND (404) being the HTTP response code
            $this->response([
                'status' => FALSE,
                'message' => 'No user was found.'
            ], REST_Controller::HTTP_NOT_FOUND);
        }
    }
    
    public function update_put() {

        $id = $this->put('id');

        $jwt=$this->input->get_request_header('Authorizations');
        
        if($jwt)
        {
         


            $data=validateJWT($id,$jwt);

            if($data)
            {
                if($id==$data->id)
                {
                    $first_name = strip_tags($this->put('first_name'));
        $last_name = strip_tags($this->put('last_name'));
        $email = strip_tags($this->put('email'));
        $password = $this->put('password');
        $phone = strip_tags($this->put('phone'));
        
        // Validate the post data
        if(!empty($id) && (!empty($first_name) || !empty($last_name) || !empty($email) || !empty($password) || !empty($phone))){
            // Update user's account data
            $userData = array();
            if(!empty($first_name)){
                $userData['first_name'] = $first_name;
            }
            if(!empty($last_name)){
                $userData['last_name'] = $last_name;
            }
            if(!empty($email)){
                $userData['email'] = $email;
            }
            if(!empty($password)){
                $userData['password'] = md5($password);
            }
            if(!empty($phone)){
                $userData['phone'] = $phone;
            }
            $update = $this->user->update($userData, $id);
            
            // Check if the user data is updated
            if($update){

                $jwtDetails=createToken($id,$email,$first_name,$last_name,$phone,getSecretKey($id));
                $jwt=$jwtDetails['key'];

                    $jwtData=array(
                        'token' => $jwt,
                        'created' => $jwtDetails['iat'],
                        'expires' => $jwtDetails['exp']
                    );

                $this->jwtModel->updateToken($id,$jwtData);

                // Set the response and exit
                $this->response([

                    'status' => TRUE,
                    'message' => 'The user info has been updated successfully.',
                    'jwt' => $jwt
                ], REST_Controller::HTTP_OK);
            }else{
                // Set the response and exit
                $this->response("Some problems occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
            }
        }else{
            // Set the response and exit
            $this->response("Provide at least one user info to update.", REST_Controller::HTTP_BAD_REQUEST);
        }
                }
            }
            else
            {
             $this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);
            }      
        

            // Get the post data
        
        }
        else{
             $this->response([
                    'status' => FALSE,
                    'message' => 'Forbidden'
                ], REST_Controller::HTTP_UNAUTHORIZED);
        }        

        
    }

     public function follow_post()
    {
        $jwt=$this->input->get_request_header('Authorizations');

        
        

         if($jwt){
            $id=$this->post('user_id');
            $data=validateJWT($id,$jwt);
             if($data)
            {
            if((int)$id==(int)$data->id){
                $userData['follow_id']=strip_tags($this->post('follow_id'));
                $userData['user_id']=$id;
                if($this->user->follow($userData))
                {
 $this->response([

                    'status' => TRUE,
                    'message' => 'Follow Successful',
                ], REST_Controller::HTTP_OK);
                }
                else
                {
                    $this->response("Some problems occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);

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

    public function change_profile_picture_post()
    {
        $jwt=$this->input->get_request_header('Authorizations');   


         if($jwt)
           {
                $id=$this->post('user_id');
                $data=validateJWT($id,$jwt);

                if($data){
                     if((int)$id==(int)$data->id){

                        if(isset($_FILES['profile_pic']) && $_FILES['profile_pic']['size'] > 0)
                        {
                            $config=getUserProfileConfig($id);

                            if(isset($this->upload))
                             {
                            $this->upload->initialize($config);
                                }
                        else
                        {
                            $this->load->library('upload', $config);

                        }
                        delete_files($config['upload_path']);
                        if($this->upload->do_upload('profile_pic'))
                        {
                                 $data = $this->upload->data();

                                 $pathToSave=base_url().'sf-content/users/'.md5($id).'/profilepicture/'.$data['file_name'];

                                 if($this->user->saveProfilePic($pathToSave,$id))
                                 { $this->response([

                    'status' => TRUE,
                    'data'=> $pathToSave,
                    'message' => 'Profile Picture updated successfully'
                ], REST_Controller::HTTP_OK);

                                 }
                                 else
                                 {
                                    $this->response("Some problems occurred while saving in database, please try again.", REST_Controller::HTTP_BAD_REQUEST);
                                 }

                                 
                                 
                        }
                        else
                        {
                            $this->response("Some problems occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
                        }




                        }
                        else
                        {
                            $this->response("Please select some image to upload", REST_Controller::HTTP_BAD_REQUEST);
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

    public function userprofile_post()
    {
        $jwt=$this->input->get_request_header('Authorizations');

        if($jwt)
        {
            $id=$this->post('user_id');
           
            $data=validateJWT($id,$jwt);
             if($data)
            {
                if((int)$id==(int)$data->id){
                    
                    $userData['friend_id']=$this->post('user_detail_id');

                    if(checkFollowStatus($id,$userData['friend_id']))
                    {   
                        $responseData['friend_profile']=$this->user->getUserProfilePublic($id,$userData['friend_id']);

                        if($responseData['friend_profile'])
                        {
                        $responseData['follow_status']=true;
                        $this->response([

                        'status' => TRUE,
                        'message' => 'User profile Fetched Successfully',
                        'data' => $responseData
                        ], REST_Controller::HTTP_OK);
                        }
                        else
                        {
                            $this->response("Some problems occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
                        }
                        

                        // image, backgroundimage, name, userid, post api, followers api, following api, count of followes and count of followings
                    }                        


                }   
                else
                {
                    $this->response(array('status'=>'Forbidden'), REST_Controller::HTTP_UNAUTHORIZED);         
                }
            }else
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