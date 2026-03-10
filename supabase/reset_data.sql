-- WARNING: This will delete ALL users and ALL table data
DELETE FROM auth.users;
-- Because of ON DELETE CASCADE, deleting auth.users will automatically 
-- delete associated rows in ai_images and mirror_chat_log if FKs are set.
-- To be safe, let's explicitly truncate ALL public tables:
TRUNCATE TABLE 
  public.ai_images,
  public.camera_emotion_log,
  public.conversation_log,
  public.mirror_chat_log,
  public.mood_entry,
  public.personality_quiz,
  public.profile
RESTART IDENTITY CASCADE;
