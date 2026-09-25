-- Create storage bucket for receipt images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Storage policies for receipts bucket
-- Users can upload their own receipts
create policy "Users can upload their own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own receipts
create policy "Users can read their own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own receipts
create policy "Users can delete their own receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
