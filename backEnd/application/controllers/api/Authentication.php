<?php
use Restserver\Libraries\REST_Controller;
if (!defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');

// Load the Rest Controller library
require APPPATH . 'libraries/REST_Controller.php';
require APPPATH . 'libraries/Format.php';


class Authentication extends REST_Controller {

    public function __construct() { 
        parent::__construct();
        
        // Load the user model
        $this->load->model('user');
        $this->load->helper('jwt');
        $this->load->model('keys/jwt_token_model','jwtModel');
    }
    
    public function login_post() {
        // Get the post data
        
       
        $email = $this->post('email');
        $password = $this->post('password');
       
        
        // Validate the post data
        if(!empty($email) && !empty($password)){
            
            // Check if any user exists with the given credentials
            $con['returnType'] = 'single';
            $con['conditions'] = array(
                'email' => $email,
                'password' => md5($password),
                'status' => 1
            );
            $user = $this->user->getRows($con);
            
            if($user){

                // Set the response and exit
                $responseData['id']=$user['id'];
                $responseData['email']=$user['email'];
                $responseData['first_name']=$user['first_name'];
                $responseData['last_name']=$user['last_name'];
                $responseData['phone']=$user['phone'];
                $responseData['profile_picture']=$user['profile_picture'];
                

                    //---------JWT TOKEN START------------------------------

                    $existingToken=checkExistingJwt($user['id']);



                    if($existingToken)
                    {
                        $responseData['jwt']=$existingToken;
                    }
                    else
                    {

                        $jwtDetail=createToken($user['id'],$user['email'],$user['first_name'],$user['last_name'],$user['phone'],$user['secret_key']);
                   
                        $jwt=$jwtDetail['key'];

                    $jwtData=array(
                        'token' => $jwt,
                        'user_id' => md5($user['id']),
                        'created' => $jwtDetail['iat'],
                        'expires' => $jwtDetail['exp']
                    );

                   $this->jwtModel->saveToken($jwtData);
                   $responseData['jwt']=$jwt;
                    }
                   
                   

                   //---------JWT TOKEN END------------------------------



                $this->response([
                    'status' => TRUE,
                    'message' => 'User login successful.',
                    'data' => $responseData
                ], REST_Controller::HTTP_OK);
            }else{
                // Set the response and exit
                //BAD_REQUEST (400) being the HTTP response code
                $this->response("Wrong email or password.", REST_Controller::HTTP_BAD_REQUEST);
            }
        }else{
            // Set the response and exit
            $this->response("Provide email and password.", REST_Controller::HTTP_BAD_REQUEST);
        }
    }
    
    public function registration_post() {
        // Get the post data
        $first_name = strip_tags($this->post('first_name'));
        $last_name = strip_tags($this->post('last_name'));
        $email = strip_tags($this->post('email'));
        $password = $this->post('password');
        $phone = strip_tags($this->post('phone'));
        
        // Validate the post data
        if(!empty($first_name) && !empty($last_name) && !empty($email) && !empty($password)){
            
            // Check if the given email already exists
            $con['returnType'] = 'count';
            $con['conditions'] = array(
                'email' => $email,
            );
            $userCount = $this->user->getRows($con);
            
            if($userCount > 0){
                // Set the response and exit
                $this->response("The given email already exists.", REST_Controller::HTTP_BAD_REQUEST);
            }else{
                // Insert user data
                $userData = array(
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'email' => $email,
                    'password' => md5($password),
                    'phone' => $phone,
                    'secret_key' => generateSecretKey()
                );
                $insert = $this->user->insert($userData);
                




                // Check if the user data is inserted
                if($insert){
                    // Set the response and exit

                    

                    //-----__RESPONSEDATA-----------


                    $responseData['email'] = $email;
                    $responseData['first_name'] = $first_name;
                    $responseData['last_name'] = $last_name;
                    $responseData['phone'] = $phone;
                    

                    //---------------------------

                    $this->response([
                        'status' => TRUE,
                        'message' => 'The user has been added successfully.',
                        'data' => $responseData
                    ], REST_Controller::HTTP_OK);
                }else{
                    // Set the response and exit
                    $this->response("Some problems occurred, please try again.", REST_Controller::HTTP_BAD_REQUEST);
                }
            }
        }else{
            // Set the response and exit
            $this->response("Provide complete user info to add.", REST_Controller::HTTP_BAD_REQUEST);
        }
    }
    
    public function user_get($id = 0) {
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
    
    public function user_put() {

        $id = $this->put('id');

        $jwt=$this->input->get_request_header('Authorization');
        
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
     public function thirdPartyLogin_post() {
        // Get the post data

       
        $firstName = $this->post('first_name');
        $lastName = $this->post('last_name');
        $email = $this->post('email');
        $profileImage = $this->post('profile_picture');
         if(!empty($email)){
       // Validate the post data
            $userData['first_name']=$firstName;
            $userData['last_name']=$lastName;
            $userData['email']=$email;
            $userData['profile_picture']=$profileImage;
            $userData['phone']='';
            $userData['secret_key']=generateSecretKey();

            $user = $this->user->thirdPartyLogin($userData);
            if($user){
                // Set the response and exit

                //---------JWT TOKEN START------------------------------
                    $existingToken=checkExistingJwt($user['id']);
                    if($existingToken)
                    {
                        $user['jwt']=$existingToken;
                    }
                    else
                    {
                        $jwtDetail=createToken($user['id'],$user['email'],$user['first_name'],$user['last_name'],$user['phone'],$user['secret_key']);
                         $jwt=$jwtDetail['key'];
                        $jwtData=array(
                        'token' => $jwt,
                        'user_id' => md5($user['id']),
                        'created' => $jwtDetail['iat'],
                        'expires' => $jwtDetail['exp']
                    );

                   $this->jwtModel->saveToken($jwtData);

                   $user['jwt']=$jwt;
                    }
                   //---------JWT TOKEN END------------------------------
                    //   print_r($existingToken);
                    // exit;
               $this->response([
                    'status' => TRUE,
                    'message' => 'User login successful.',
                    'data' => $user
                ], REST_Controller::HTTP_OK);
            }else{
                // Set the response and exit
                //BAD_REQUEST (400) being the HTTP response code
                $this->response("Something Went Wrong", REST_Controller::HTTP_BAD_REQUEST);
            }
            }else{
            // Set the response and exit
            $this->response("Provide email", REST_Controller::HTTP_BAD_REQUEST);
        }
        
    }

}