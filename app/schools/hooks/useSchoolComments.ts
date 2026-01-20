'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSchoolComments() {
  const [commentCounts, setCommentCounts] = useState<any[]>([]);
  const [deskComments, setDeskComments] = useState<any[]>([]);
  const [stateComments, setStateComments] = useState<any[]>([]);

  // -------- COUNTS --------
  const fetchCommentCounts = async () => {
    const { data, error } = await supabase
      .from('school_comment_counts')
      .select('*');

    if (error) {
      console.error('Comment count fetch failed', error.message);
      return;
    }

    setCommentCounts(data || []);
  };

  const commentCountMap = useMemo(() => {
    return Object.fromEntries(
      (commentCounts || []).map(c => [
        c.school_id,
        { desk: c.desk_count, state: c.state_count }
      ])
    );
  }, [commentCounts]);

  // -------- COMMENTS --------
  const fetchCommentsForSchool = async (schoolId: string) => {
    const { data, error } = await supabase
      .from('school_comments')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    setDeskComments(data.filter(c => c.comment_role === 'desk'));
    setStateComments(data.filter(c => c.comment_role === 'state'));
  };

  const saveComment = async (
    schoolId: string,
    role: 'desk' | 'state',
    text: string,
    editingId?: string
  ) => {
    let error;

    if (editingId) {
      const res = await supabase
        .from('school_comments')
        .update({
          comment_text: text,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      error = res.error;
    } else {
      const res = await supabase
        .from('school_comments')
        .insert({
          school_id: schoolId,
          comment_text: text,
          comment_role: role,
        });

      error = res.error;
    }

    if (error) throw error;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('school_comments')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) throw error;
  };

  return {
    deskComments,
    stateComments,
    commentCountMap,
    fetchCommentCounts,
    fetchCommentsForSchool,
    saveComment,
    deleteComment,
  };
}

