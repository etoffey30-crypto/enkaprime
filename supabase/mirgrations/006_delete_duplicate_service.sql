/*
  # Remove duplicate Records Digitalisation service row without a picture
  Migration 006: Delete the empty code/empty image duplicate row.
*/

DELETE FROM services WHERE code = '' OR image_url = '';
