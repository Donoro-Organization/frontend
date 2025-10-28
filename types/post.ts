import { LocalFileResponse } from "./file";
import { UploadingPost } from "@/contexts/PostUploadContext";

export interface Post {
  id: string;
  content: string;
  location?: string;
  donor_id: string;
  images: LocalFileResponse[];
  created_at: string;
  updated_at: string;
}

export interface PostCreateRequest {
  content: string;
  location?: string;
}

export interface PostUpdateRequest {
  content?: string;
  location?: string;
}

export interface PostsResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  posts: Post[];
}

export interface PendingPost {
  id: string;
  content: string;
  location?: string;
  donor_id?: string;
  images?: LocalFileResponse[];
  isPending: true;
  created_at: string;
  updated_at?: string;
  uploadProgress?: UploadingPost;
}
