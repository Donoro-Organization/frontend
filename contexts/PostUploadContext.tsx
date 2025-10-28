import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UploadingPost {
    postId: string;
    totalImages: number;
    uploadedImages: number;
    status: 'uploading' | 'completed' | 'failed';
    isEdit?: boolean;
}

interface PostUploadContextType {
    uploadingPosts: Map<string, UploadingPost>;
    startUpload: (postId: string, totalImages: number, isEdit?: boolean) => void;
    updateProgress: (postId: string, uploadedImages: number) => void;
    completeUpload: (postId: string, onComplete?: () => void) => void;
    failUpload: (postId: string) => void;
    removeUpload: (postId: string) => void;
}

const PostUploadContext = createContext<PostUploadContextType | undefined>(undefined);

export const PostUploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [uploadingPosts, setUploadingPosts] = useState<Map<string, UploadingPost>>(new Map());

    const startUpload = useCallback((postId: string, totalImages: number, isEdit: boolean = false) => {
        console.log('PostUploadContext: Starting upload for post', postId, 'with', totalImages, 'images', isEdit ? '(edit)' : '(new)');
        setUploadingPosts(prev => {
            const newMap = new Map(prev);
            newMap.set(postId, {
                postId,
                totalImages,
                uploadedImages: 0,
                status: 'uploading',
                isEdit,
            });
            console.log('PostUploadContext: Updated map size:', newMap.size);
            return newMap;
        });
    }, []);

    const updateProgress = useCallback((postId: string, uploadedImages: number) => {
        console.log('PostUploadContext: Updating progress for post', postId, 'to', uploadedImages);
        setUploadingPosts(prev => {
            const newMap = new Map(prev);
            const post = newMap.get(postId);
            if (post) {
                newMap.set(postId, {
                    ...post,
                    uploadedImages,
                });
            }
            return newMap;
        });
    }, []);

    const completeUpload = useCallback((postId: string, onComplete?: () => void) => {
        console.log('PostUploadContext: Completing upload for post', postId);
        setUploadingPosts(prev => {
            const newMap = new Map(prev);
            const post = newMap.get(postId);
            if (post) {
                newMap.set(postId, {
                    ...post,
                    status: 'completed',
                    uploadedImages: post.totalImages,
                });
            }
            return newMap;
        });

        // Call the completion callback
        if (onComplete) {
            onComplete();
        }

        // Remove from map after a short delay
        setTimeout(() => {
            console.log('PostUploadContext: Removing completed upload for post', postId);
            setUploadingPosts(prev => {
                const newMap = new Map(prev);
                newMap.delete(postId);
                return newMap;
            });
        }, 1000);
    }, []);

    const failUpload = useCallback((postId: string) => {
        setUploadingPosts(prev => {
            const newMap = new Map(prev);
            const post = newMap.get(postId);
            if (post) {
                newMap.set(postId, {
                    ...post,
                    status: 'failed',
                });
            }
            return newMap;
        });
    }, []);

    const removeUpload = useCallback((postId: string) => {
        setUploadingPosts(prev => {
            const newMap = new Map(prev);
            newMap.delete(postId);
            return newMap;
        });
    }, []);

    return (
        <PostUploadContext.Provider
            value={{
                uploadingPosts,
                startUpload,
                updateProgress,
                completeUpload,
                failUpload,
                removeUpload,
            }}
        >
            {children}
        </PostUploadContext.Provider>
    );
};

export const usePostUpload = () => {
    const context = useContext(PostUploadContext);
    if (context === undefined) {
        throw new Error('usePostUpload must be used within a PostUploadProvider');
    }
    return context;
};
