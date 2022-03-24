<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once APPPATH . '/libraries/SignatureInvalidException.php';
require_once APPPATH . '/libraries/ExpiredException.php';
require_once APPPATH . '/libraries/BeforeValidException.php';
require_once APPPATH . '/libraries/JWT.php';
use \Firebase\JWT\JWT;

date_default_timezone_set('Asia/Kolkata');
	// -----------------------------------------------------------------------------
   

    function createToken($id,$email,$first_name,$last_name,$phone,$key)
    {
                    $token['token_id'] = md5(uniqid());
    	            $token['id'] = $id;
    	            $token['email'] = $email;
                    $token['first_name'] = $first_name;
                    $token['last_name'] = $last_name;
                    $token['phone'] = $phone;
                    $date = new DateTime();
                    $token['iat'] = $date->getTimestamp();
                    $token['exp'] = $date->getTimestamp()+60*60;

                     $jwt['iat'] = $token['iat'];
                      $jwt['exp'] = $token['exp'];

                     $jwt['key']= JWT::encode($token, $key);

                     return $jwt?$jwt:false;
                    
    }
    function generateSecretKey()
    {
        return md5(uniqid());
    }

    function getSecretKey($id)
    {
           $CI = & get_instance();
           $CI->db->select('secret_key');
           $CI->db->where('id',$id);
          return $CI->db->get('ci_users')->row()->secret_key;

    }

    function ValidateJWT($id,$jwt)
    {
      
        $CI = & get_instance();
        $CI->db->select('ci_jwttokens.*');
        $CI->db->from('ci_jwttokens');
        $CI->db->join('ci_users','md5(ci_users.id)=ci_jwttokens.user_id');
        $CI->db->where('ci_users.id',$id);
        $CI->db->where('ci_jwttokens.token',$jwt);

      

        $jwtQuery=$CI->db->get();

        
    
        if($jwtQuery->num_rows()>0)
        {
            try
            {
                
                $data=JWT::decode($jwt, getSecretKey($id), array('HS256'));

                
                return $data;
            }
            catch(Exception $ex)
            {
                 return false;
            }
        }
        else
        {
           return false;
        }


      
    }

    function checkExistingJwt($id)
    {
        $date = new DateTime();
        if(!empty($id))
        {
             $CI = & get_instance();
             $CI->db->select('*');
             $CI->db->where('user_id',md5($id));
             $jwtQuery=$CI->db->get('ci_jwttokens');

             if($jwtQuery->num_rows()>0)
             {
               
                if($jwtQuery->row()->expires>$date->getTimestamp())
                {
                //   print_r($jwtQuery->row()->token); 
                  return $jwtQuery->row()->token; 
                }
                else
                {
                    $CI -> db -> where('user_id', md5($id));
                    $CI -> db -> delete('ci_jwttokens');

                    return false;
                }
             }
             else
             {
                return false;
             }

        }
        else
        {
            return false;
        }
    }
?>