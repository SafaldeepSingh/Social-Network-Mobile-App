<?php
if (!defined('BASEPATH')) exit('No direct script access allowed');

class Notifications extends CI_Model {
	public function __construct() {
        parent::__construct();
        
        // Load the database library
        $this->load->database();
        $this->load->model('post');
    }

    public function add($data) {
        $this->db->insert('ci_notifications', $data);
    }
    public function remove($data) {
        $this->db->delete('ci_notifications', $data);
    }
    public function getCount($userId) {
        $c1 = $this->db->from('ci_notifications')->join('ci_posts', 'ci_posts.post_id = ci_notifications.post_id')->join('ci_users', 'ci_users.id = ci_notifications.user')->where('ci_posts.user_id', $userId)
                            ->where('ci_notifications.seen','0')->get()->num_rows();
        $c2 = $this->db->from('ci_notifications')->join('ci_comments', 'ci_comments.id = ci_notifications.comment_id')->join('ci_posts', 'ci_posts.post_id = ci_comments.post')->join('ci_users', 'ci_users.id = ci_notifications.user')->where('ci_posts.user_id', $userId)
                            ->where('ci_notifications.seen','0')->get()->num_rows();                            

        return ($c1 + $c2);
    }
    public function get($userId) {
        $notificationsPost = $this->db->select('ci_users.profile_picture as profileImage, ci_users.first_name as firstName, ci_users.last_name as lastName, ci_notifications.*, ci_posts.post_id as postId')
                            ->from('ci_notifications')
                            ->join('ci_posts', 'ci_posts.post_id = ci_notifications.post_id')
                            ->join('ci_users', 'ci_users.id = ci_notifications.user')
                            ->where('ci_posts.user_id', $userId)
                            ->get()->result_array();

        $notificationsComment = $this->db->select('ci_users.profile_picture as profileImage, ci_users.first_name as firstName, ci_users.last_name as lastName, ci_notifications.*,
                                ci_posts.post_id as postId, ci_comments.comment_text as comment')
                            ->from('ci_notifications')
                            ->join('ci_comments', 'ci_comments.id = ci_notifications.comment_id')
                            ->join('ci_posts', 'ci_posts.post_id = ci_comments.post')
                            ->join('ci_users', 'ci_users.id = ci_notifications.user')
                            ->where('ci_posts.user_id', $userId)
                            ->get()->result_array();
        $followRequest = $this->db->select('ci_users.profile_picture as profileImage, ci_users.first_name as firstName, ci_users.last_name as lastName, ci_notifications.*')
                                    ->from('ci_notifications')
                                    ->where('ci_notifications.type', 'followRequest')
                                    ->where('ci_notifications.requested_user', $userId)
                                    ->join('ci_users', 'ci_users.id = ci_notifications.user')
                                    ->get()->result_array();
        $notifications = array_merge($notificationsPost, $notificationsComment, $followRequest);
        foreach($notifications as $key => $value) {
            if ($value['type']!= 'followRequest') {
                $notifications[$key]['postPhoto'] = $this->post->getPostFirstAttachement($value['postId'])['attachment'];
            }
            $this->db->update('ci_notifications', array('seen'=> '1'), array('id' => $value['id']));
        }
        function my_sort($a,$b)
        {
        if ($a['created_date']==$b['created_date']) return 0;
        return ($a['created_date']>$b['created_date'])?-1:1;
        }
        
        usort($notifications,"my_sort");
        
        return $notifications;
    }
    
    public function confirmFollowRequest($user_id, $follower_id) {
        $follow = $this->user->follow(array('user_id' => $follower_id, 'follow_id' => $user_id));
        if($follow == 'Followed Successfully') {
            $this->db->delete('ci_notifications', array('user'=> $follower_id, 'requested_user' => $user_id));
            return true;
        }    
        return false;
    }
    public function deleteFollowRequest($user_id, $follower_id) {
            $this->db->delete('ci_notifications', array('user'=> $follower_id, 'requested_user' => $user_id));
            return true;
    }
          
    }


?>