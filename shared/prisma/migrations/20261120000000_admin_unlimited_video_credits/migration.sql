-- Admins created from the dashboard were given the student default (10) instead of
-- unlimited (NULL). Admins' credits can't be changed on the Users page, so any number
-- here came from that bug.
UPDATE "User" SET "videoTranscodeCredits" = NULL WHERE "role" = 'ADMIN';
