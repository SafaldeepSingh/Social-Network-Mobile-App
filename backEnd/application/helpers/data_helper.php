<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
date_default_timezone_set('Asia/Kolkata');


function checkFollowStatus($user,$follow){
    $CI = & get_instance();
        $CI->db->select('*');
        $CI->db->where('user_id',$user);
        $CI->db->where('follow_id',$follow);
        $query=$CI->db->get('ci_follows');
        if($query->num_rows()>0)
        {
            return true;
        }
        else
        {
            return false;
        }
   }

   ?>