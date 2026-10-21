// Cloudflare Workers / Pages Functions API for KNOU CS Gwangju-Jeonnam
// D1 Database API Route

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource'); // 'notices' | 'events' | 'materials' | 'freeposts' | 'feedbacks' | 'studies' | 'members'
  const id = url.searchParams.get('id');

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 binding (DB) not found' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    // 1. 공지사항 (notices)
    if (resource === 'notices') {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM notices ORDER BY is_pinned DESC, created_at DESC'
        ).all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }
      if (request.method === 'POST') {
        const body: any = await request.json();
        const newNotice = {
          id: body.id || `notice-${Date.now()}`,
          title: body.title,
          content: body.content,
          category: body.category || '학생회',
          author: body.author || '학생회',
          created_at: body.created_at || new Date().toISOString().split('T')[0],
          views: body.views || 1,
          is_pinned: body.is_pinned ? 1 : 0,
          file_name: body.file_name || null,
          file_url: body.file_url || null,
        };
        await env.DB.prepare(
          `INSERT INTO notices (id, title, content, category, author, created_at, views, is_pinned, file_name, file_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          newNotice.id, newNotice.title, newNotice.content, newNotice.category,
          newNotice.author, newNotice.created_at, newNotice.views, newNotice.is_pinned,
          newNotice.file_name, newNotice.file_url
        ).run();
        return new Response(JSON.stringify(newNotice), { headers: corsHeaders });
      }
      if (request.method === 'DELETE' && id) {
        await env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
    }

    // 2. 학습자료실 (materials)
    if (resource === 'materials') {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM academic_materials ORDER BY created_at DESC'
        ).all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }
      if (request.method === 'POST') {
        const body: any = await request.json();
        const newMat = {
          id: body.id || `mat-${Date.now()}`,
          grade: body.grade,
          semester: body.semester,
          course_name: body.course_name,
          title: body.title,
          description: body.description || '',
          category: body.category,
          author: body.author || '학우',
          created_at: body.created_at || new Date().toISOString().split('T')[0],
          downloads: 0,
          file_name: body.file_name || null,
          file_size: body.file_size || null,
          file_url: body.file_url || null,
        };
        await env.DB.prepare(
          `INSERT INTO academic_materials (id, grade, semester, course_name, title, description, category, author, created_at, downloads, file_name, file_size, file_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          newMat.id, newMat.grade, newMat.semester, newMat.course_name, newMat.title,
          newMat.description, newMat.category, newMat.author, newMat.created_at,
          newMat.downloads, newMat.file_name, newMat.file_size, newMat.file_url
        ).run();
        return new Response(JSON.stringify(newMat), { headers: corsHeaders });
      }
      if (request.method === 'PUT' && id) {
        const body: any = await request.json();
        if (body.increment_download) {
          await env.DB.prepare('UPDATE academic_materials SET downloads = downloads + 1 WHERE id = ?').bind(id).run();
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }
        await env.DB.prepare(
          `UPDATE academic_materials 
           SET grade = ?, semester = ?, course_name = ?, title = ?, description = ?, category = ?, author = ?, file_name = ?, file_size = ?
           WHERE id = ?`
        ).bind(
          body.grade, body.semester, body.course_name, body.title,
          body.description, body.category, body.author, body.file_name, body.file_size, id
        ).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (request.method === 'DELETE' && id) {
        await env.DB.prepare('DELETE FROM academic_materials WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
    }

    // 3. 자유게시판 (freeposts)
    if (resource === 'freeposts') {
      if (request.method === 'GET') {
        const { results: posts } = await env.DB.prepare(
          'SELECT * FROM free_posts ORDER BY created_at DESC'
        ).all();
        const { results: replies } = await env.DB.prepare(
          'SELECT * FROM free_post_replies ORDER BY created_at ASC'
        ).all();
        
        const combined = posts.map((p: any) => ({
          ...p,
          replies: replies.filter((r: any) => r.post_id === p.id),
        }));
        return new Response(JSON.stringify(combined), { headers: corsHeaders });
      }
      if (request.method === 'POST') {
        const body: any = await request.json();
        if (body.type === 'reply') {
          const newReply = {
            id: `reply-${Date.now()}`,
            post_id: body.post_id,
            author: body.author || '익명',
            content: body.content,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
          await env.DB.prepare(
            'INSERT INTO free_post_replies (id, post_id, author, content, created_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(newReply.id, newReply.post_id, newReply.author, newReply.content, newReply.created_at).run();
          return new Response(JSON.stringify(newReply), { headers: corsHeaders });
        }

        const newPost = {
          id: body.id || `free-${Date.now()}`,
          title: body.title,
          content: body.content,
          category: body.category || '자유',
          author: body.author || '익명 학우',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          views: 1,
          replies: [],
        };
        await env.DB.prepare(
          'INSERT INTO free_posts (id, title, content, category, author, created_at, views) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(newPost.id, newPost.title, newPost.content, newPost.category, newPost.author, newPost.created_at, newPost.views).run();
        return new Response(JSON.stringify(newPost), { headers: corsHeaders });
      }
      if (request.method === 'DELETE' && id) {
        await env.DB.prepare('DELETE FROM free_posts WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
    }

    // 4. 건의함 (feedbacks)
    if (resource === 'feedbacks') {
      if (request.method === 'GET') {
        const { results: feedbacks } = await env.DB.prepare(
          'SELECT * FROM feedbacks ORDER BY created_at DESC'
        ).all();
        const { results: replies } = await env.DB.prepare(
          'SELECT * FROM feedback_replies ORDER BY created_at ASC'
        ).all();
        const combined = feedbacks.map((f: any) => ({
          ...f,
          replies: replies.filter((r: any) => r.feedback_id === f.id),
        }));
        return new Response(JSON.stringify(combined), { headers: corsHeaders });
      }
      if (request.method === 'POST') {
        const body: any = await request.json();
        if (body.type === 'reply') {
          const newReply = {
            id: `fb-reply-${Date.now()}`,
            feedback_id: body.feedback_id,
            author: body.author || '학생회',
            content: body.content,
            created_at: new Date().toISOString().split('T')[0],
          };
          await env.DB.prepare(
            'INSERT INTO feedback_replies (id, feedback_id, author, content, created_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(newReply.id, newReply.feedback_id, newReply.author, newReply.content, newReply.created_at).run();
          await env.DB.prepare("UPDATE feedbacks SET status = '답변완료' WHERE id = ?").bind(body.feedback_id).run();
          return new Response(JSON.stringify(newReply), { headers: corsHeaders });
        }

        const newFeedback = {
          id: body.id || `fb-${Date.now()}`,
          title: body.title,
          content: body.content,
          category: body.category || '기타',
          author: body.author || '익명 학우',
          created_at: new Date().toISOString().split('T')[0],
          status: '접수완료',
          replies: [],
        };
        await env.DB.prepare(
          'INSERT INTO feedbacks (id, title, content, category, author, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(newFeedback.id, newFeedback.title, newFeedback.content, newFeedback.category, newFeedback.author, newFeedback.created_at, newFeedback.status).run();
        return new Response(JSON.stringify(newFeedback), { headers: corsHeaders });
      }
    }

    // 5. 학사일정 (events)
    if (resource === 'events') {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM academic_events ORDER BY start_date ASC').all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }
      if (request.method === 'POST') {
        const body: any = await request.json();
        const newEvent = {
          id: body.id || `event-${Date.now()}`,
          title: body.title,
          start_date: body.start_date,
          end_date: body.end_date,
          category: body.category || '학사',
          description: body.description || '',
          target_grades: body.target_grades || '전학년',
          is_important: body.is_important ? 1 : 0,
        };
        await env.DB.prepare(
          `INSERT INTO academic_events (id, title, start_date, end_date, category, description, target_grades, is_important)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(newEvent.id, newEvent.title, newEvent.start_date, newEvent.end_date, newEvent.category, newEvent.description, newEvent.target_grades, newEvent.is_important).run();
        return new Response(JSON.stringify(newEvent), { headers: corsHeaders });
      }
    }

    // 6. 스터디 (studies)
    if (resource === 'studies') {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM studies ORDER BY created_at DESC').all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }
      if (request.method === 'POST') {
        const body: any = await request.json();
        const newStudy = {
          id: body.id || `study-${Date.now()}`,
          title: body.title,
          subject: body.subject,
          status: body.status || '모집중',
          members_count: body.members_count || 1,
          max_members: body.max_members || 8,
          target_grade: body.target_grade || '전학년',
          meeting_type: body.meeting_type || '온/오프라인 병행',
          leader: body.leader || '익명 학우',
          leader_contact: body.leader_contact || '',
          description: body.description || '',
          created_at: new Date().toISOString().split('T')[0],
        };
        await env.DB.prepare(
          `INSERT INTO studies (id, title, subject, status, members_count, max_members, target_grade, meeting_type, leader, leader_contact, description, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          newStudy.id, newStudy.title, newStudy.subject, newStudy.status,
          newStudy.members_count, newStudy.max_members, newStudy.target_grade,
          newStudy.meeting_type, newStudy.leader, newStudy.leader_contact,
          newStudy.description, newStudy.created_at
        ).run();
        return new Response(JSON.stringify(newStudy), { headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: 'Unknown resource or unsupported method' }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
