<?php
if (!defined('BASEPATH')) exit('No direct script access allowed');

class Post extends CI_Model {

    public function __construct() {
        parent::__construct();
        
        // Load the database library
        $this->load->database();
        $this->load->model('comment');
        $this->load->model('user');
        $this->load->model('likes');
        $this->userTbl = 'ci_posts';

    }
    public function getPostFirstAttachement($id) {
	    return $this->db->where('postid',$id)->get('post_attachments')->row_array();
    }

    public function insert($data)
    {
    	 //add created and modified date if not exists
        if(!array_key_exists("created_date", $data)){
            $data['created_date'] = date("Y-m-d H:i:s");
        }
        if(!array_key_exists("modified_date", $data)){
            $data['modified_date'] = date("Y-m-d H:i:s");
        }
        
        //insert user data to users table
        $insert = $this->db->insert($this->userTbl, $data);
        if($insert) {
            return $this->getPost($this->db->insert_id(), $data['user_id']);
        }
        return false;
    }
    public function getPost($postId, $id)
    {
    	$this->db->select('*');
    	$this->db->where('post_id',$postId);
    	$query=$this->db->get($this->userTbl);
	 	$row=$query->row_array();
	 	if ($row['share_post_id']!= -1) {
    	 	$row['sharePost'] = $this->db->where('post_id', $row['share_post_id'])->get('ci_posts')->row_array();
    	 	$row['sharePost']['attachments']=$this->db->where('postid',$row['share_post_id'])->get('post_attachments')->result_array();
    	 	$row['sharePost']['userData']=$this->user->getRows(array('id' => $row['sharePost']['user_id']));
    	}
	    $row['likeStatus']=false;
	    $row['userData']=$this->user->getRows(array('id' => $row['user_id']));
		$this->db->select('*');
    	$this->db->where('postid',$postId);
    	$attachmentQuery=$this->db->get('post_attachments');
    	if($attachmentQuery->num_rows()>0)
    	{
    		$row['attachments']=$attachmentQuery->result_array();	
    	}
    	$commentQuery=$this->comment->getByPost($postId, $id);
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
    		$result[$index]['comments']=$commentsArray;	
    	}
        $likeQuery=$this->likes->getByPost($row['post_id']);
        if($likeQuery)
        {
            $row['likes']=$likeQuery;                     }
	 		return $row;
    	}

    public function getall($id, $userPosts=false, $loggedinUserId)
    {
    	$this->db->select('*');
    	if($userPosts){
    	$this->db->where('user_id',$id);
    	} 
    // 	else
    // 	$this->db->where('user_id!=',$id);
    	$this->db->order_by('created_date', 'DESC');
    	$query=$this->db->get($this->userTbl);
        // print_r($query->result);
        // exit;
    	if($query->num_rows()>0)
    	{
	 		$result=$query->result_array();

	 		foreach($result as $index=>$row)
	 		{
	 		    if ($row['share_post_id']!= -1) {
	 		        $result[$index]['sharePost'] = $this->db->where('post_id', $row['share_post_id'])->get('ci_posts')->row_array();
	 		        $result[$index]['sharePost']['attachments']=$this->db->where('postid',$row['share_post_id'])->get('post_attachments')->result_array();
	 		        $result[$index]['sharePost']['userData']=$this->user->getRows(array('id' => $result[$index]['sharePost']['user_id']));
	 		    }
	 		    
	 		    $result[$index]['likeStatus']=$this->likes->getLikeStatus(['post' => $row['post_id'], 'user' => $loggedinUserId]);
	 		    $result[$index]['userData']=$this->user->getRows(array('id' => $row['user_id']));
	 			$this->db->select('*');
	 			$this->db->where('postid',$row['post_id']);
	 			$attachmentQuery=$this->db->get('post_attachments');
	 			if($attachmentQuery->num_rows()>0)
	 			{
	 				$result[$index]['attachments']=$attachmentQuery->result_array();	
	 			}
	 			
	 			$commentQuery=$this->comment->getByPost($row['post_id'], $id);
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

	 				$result[$index]['comments']=$commentsArray;	
	 			}

                $likeQuery=$this->likes->getByPost($row['post_id']);

                if($likeQuery)
                {
                         

                    $result[$index]['likes']=$likeQuery; 
                }

	 			


	 		}
	 		$data['result']=$result;
	 		if($userPosts){
	 		        	$followings= $this->db->from('ci_follows')
	 		        	->join('ci_users','ci_users.id=ci_follows.follow_id')
	 		        	->where('ci_follows.user_id', $id)
	 		        	->get()->result_array();
    	$data['followers']=$this->db->from('ci_follows')
    	                    ->join('ci_users','ci_users.id=ci_follows.user_id')
    	                    ->where('ci_follows.follow_id', $id)
    	                    ->get()->result_array();
    
	 	$data['followings']=$followings;
	 		}
	 		return $data;
    	}
    	else
    	{
     		if($userPosts){
	 		        	$followings= $this->db->from('ci_follows')->where('user_id', $id)->get()->result_array();
    	$data['followers']=$this->db->from('ci_follows')->where('follow_id', $id)->get()->result_array();
    
	 	$data['followings']=$followings;
	 		}
	 		$data['result']=false;
	 		return $data;
    	}

    }

    public function deletePost($id,$postid)
    {
    	$this->db->where('user_id',$id);
    	$this->db->where('post_id',$postid);
    	$result=$this->db->get($this->userTbl);

    	if($result->num_rows()>0)
    	{
    		$this->db->where('user_id',$id);
    	$this->db->where('post_id',$postid);
    		$this->db->delete($this->userTbl);
    		return true;
    	}
    	else
    	{
    		return false;
    	}
    		

    }

    public function update($id,$postid,$userdata){

    	$this->db->where('user_id',$id);
    	$this->db->where('post_id',$postid);
    	$result=$this->db->get($this->userTbl);

    	if($result->num_rows()>0)
    	{
    		$this->db->where('user_id',$id);
    	$this->db->where('post_id',$postid);
    	$this->db->update($this->userTbl,$userdata);

    	return true;

    	}else{
    		return false;
    	}

    }
    
    	
    	public function delete($post)
    	{
    		$this->db->where('post_id',$post);
    		$this->db->delete($this->userTbl);
    	}


    	public function saveImages($data)
    	{
    		$this->db->insert_batch('post_attachments',$data);
    	}

    	public function updateCommentCount($post_id)
    	{
    	$this->db->select('comment_count');
    	$this->db->where('post_id',$post_id);
    	$query=$this->db->get($this->userTbl);


    	if($query->num_rows()>0)
    	{
    		$userData['comment_count']=((int)$query->row()->comment_count)+1;
    		$this->db->where('post_id',$post_id);
    		$this->db->update($this->userTbl,$userData);
    	}
    	else
    	{
    		return false;
    	}


    	}

        public function updateLikeCount($post_id, $operation)
        {
            $this->db->select('like_count');
            $this->db->where('post_id',$post_id);
            $query=$this->db->get($this->userTbl);


        if($query->num_rows()>0)
        {
            if($operation=='plus')
            $userData['like_count']=((int)$query->row()->like_count)+1;
            else
            $userData['like_count']=((int)$query->row()->like_count)-1;
            
            $this->db->where('post_id',$post_id);
            $this->db->update($this->userTbl,$userData);
            return $userData['like_count'];
        }
        else
        {
            return false;
        }
        }


}