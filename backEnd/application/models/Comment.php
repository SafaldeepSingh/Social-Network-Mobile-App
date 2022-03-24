<?php
if (!defined('BASEPATH')) exit('No direct script access allowed');

class Comment extends CI_Model {

	  public function __construct() {
        parent::__construct();
        
        // Load the database library
        $this->load->database();
        
        $this->userTbl = 'ci_comments';
          
    }
        public function toggleLike($data){
           $array=array('user' => $data['user'], 'comment' => $data['comment']);
           $message;
           if($this->db->where($array)->get('ci_comments_likes')->num_rows()>0){
                $operation=$this->db->delete('ci_comments_likes', $array);
                $message=$operation?'UnLiked Successfully': false;
            }
           else {
                $operation=$this->db->insert('ci_comments_likes',$array);
                $message=$operation?'Liked Successfully': false;
           }
         return $message;
        }
        public function getLikeStatus($data){
           $array=array('user' => $data['user'], 'comment' => $data['comment']);
           $status;
           if($this->db->where($array)->get('ci_comments_likes')->num_rows()>0){
                $status=true;
            }
           else {
                $status=false;
           }
         return $status;
        }


        public function insert($data){

        	if(!array_key_exists("created_date", $data)){
            $data['created_date'] = date("Y-m-d H:i:s");
        	}


        	if(!array_key_exists("modified_date", $data)){
            $data['modified_date'] = date("Y-m-d H:i:s");
       	 	}

       	 	$insert = $this->db->insert($this->userTbl, $data);
       	 	

       	 	 return $insert?$this->db->insert_id():false;
        }
        public function getByPost($post_id, $user_id)
        {
        	$this->db->select($this->userTbl.'.*');
            $this->db->select('ci_users.first_name');
            $this->db->select('ci_users.last_name');
            $this->db->select('ci_users.profile_picture');
    	$this->db->where($this->userTbl.'.post',$post_id);
        $this->db->join('ci_users','ci_comments.user_id=ci_users.id');
    	$query=$this->db->get($this->userTbl);
    	if($query->num_rows()>0)
    	{
    	    $result = $query->result_array();
    	   foreach($result as $index => $value) {
    	       $data['user'] = $user_id; 
    	       $data['comment'] = $value['id'] ;
    	       $result[$index]['likeStatus']= $this->getLikeStatus($data);
    	   }

    		return $result;
    	}
    	else
    	{
    		return false;
    	}


        }
    
}