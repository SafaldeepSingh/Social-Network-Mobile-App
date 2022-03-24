<?php
if (!defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');

class Jwt_token_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        
        // Load the database library
        $this->load->database();
        
        $this->userTbl = 'ci_jwttokens';
    }


    public function saveToken($data)
    {
    	$insert = $this->db->insert($this->userTbl, $data);
    }
      public function updateToken($id,$data)
    {
        $this->db->where('user_id',md5($id));
        $update = $this->db->update($this->userTbl, $data);
    }

}

?>