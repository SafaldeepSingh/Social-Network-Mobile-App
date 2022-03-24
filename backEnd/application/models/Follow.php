<?php
if (!defined('BASEPATH')) exit('No direct script access allowed');

class Follow extends CI_Model {

    public function __construct() {
        parent::__construct();
        
        // Load the database library
        $this->load->database();
        
        $this->userTbl = 'ci_users';
    }

    

}