<?php
if (!defined('BASEPATH')) exit('No direct script access allowed');

class Likes extends CI_Model {
	public function __construct() {
        parent::__construct();
        
        // Load the database library
        $this->load->database();
        
        $this->userTbl = 'ci_likes';
    }
   public function getLikeStatus($data)
   {
        $array=array('post' => $data['post'], 'user' => $data['user']);
        $status;
          if($this->db->where($array)->get('ci_likes')->num_rows()>0){
            $status=true;
        }
       else {
            $status=false;
               }
     return $status;
   }

         public function toggleStatus($data){
              $array=array('post' => $data['post'], 'user' => $data['user']);
               $status;
               if($this->db->where($array)->get('ci_likes')->num_rows()>0){
                    $operation=$this->db->delete('ci_likes', $array);
                    $status=$operation?'UnLiked Successfully': false;
                }
               else {
                    $operation=$this->db->insert('ci_likes',$data);
                    $status=$operation?'Liked Successfully': false;
               }
             return $status;
        }

       
        public function getByPost($post_id)
        {
        	$this->db->select($this->userTbl.'.*');
            $this->db->select('ci_users.first_name');
            $this->db->select('ci_users.last_name');
            $this->db->select('ci_users.profile_picture');
    	$this->db->where($this->userTbl.'.post',$post_id);
        $this->db->join('ci_users','ci_likes.user=ci_users.id');
    	$query=$this->db->get($this->userTbl);

    	if($query->num_rows()>0)
    	{
    		return $query->result_array();
    	}
    	else
    	{
    		return false;
    	}


        }

         public function getAll($post_id, $user_id)
        {
        	$this->db->select($this->userTbl.'.user');
            $this->db->select('ci_users.first_name');
            $this->db->select('ci_users.last_name');
            $this->db->select('ci_users.profile_picture');
    	$this->db->where($this->userTbl.'.post',$post_id);
        $this->db->join('ci_users','ci_likes.user=ci_users.id');
    	$query=$this->db->get($this->userTbl);

    	if($query->num_rows()>0)
    	{
    	    $result=$query->result_array();
   	 		foreach($result as $index=>$row)
   	 		{
   	 		    $data['user_id']= $user_id;
   	 		    $data['follow_id']= $row['user'];
   	 		    $result[$index]['followStatus']= $this->user->getFollowStatus($data);
   	 		}
    		return $result ;
    	}
    	else
    	{
    		return false;
    	}


        }



          
    }


?>