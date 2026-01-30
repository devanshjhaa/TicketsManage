package com.ticketsmanage.backend.attachment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Upload a file to S3
     * 
     * @param file MultipartFile to upload
     * @param key  S3 object key (path)
     * @return S3 object key
     */
    public String uploadFile(MultipartFile file, String key) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("Successfully uploaded file to S3: {}", key);
            return key;

        } catch (IOException e) {
            log.error("Failed to upload file to S3: {}", key, e);
            throw new RuntimeException("Failed to upload file to S3", e);
        } catch (S3Exception e) {
            log.error("S3 error while uploading file: {}", key, e);
            throw new RuntimeException("S3 error: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    /**
     * Download a file from S3
     * 
     * @param key S3 object key
     * @return InputStream of the file
     */
    public InputStream downloadFile(String key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            return s3Client.getObject(getObjectRequest);

        } catch (NoSuchKeyException e) {
            log.error("File not found in S3: {}", key, e);
            throw new RuntimeException("File not found in S3", e);
        } catch (S3Exception e) {
            log.error("S3 error while downloading file: {}", key, e);
            throw new RuntimeException("S3 error: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    /**
     * Delete a file from S3
     * 
     * @param key S3 object key
     */
    public void deleteFile(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Successfully deleted file from S3: {}", key);

        } catch (S3Exception e) {
            log.error("S3 error while deleting file: {}", key, e);
            throw new RuntimeException("S3 error: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    /**
     * Check if a file exists in S3
     * 
     * @param key S3 object key
     * @return true if file exists, false otherwise
     */
    public boolean fileExists(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            log.error("S3 error while checking file existence: {}", key, e);
            throw new RuntimeException("S3 error: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    /**
     * Get the content type of a file in S3
     * 
     * @param key S3 object key
     * @return Content type
     */
    public String getContentType(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            HeadObjectResponse response = s3Client.headObject(headObjectRequest);
            return response.contentType();

        } catch (S3Exception e) {
            log.error("S3 error while getting content type: {}", key, e);
            throw new RuntimeException("S3 error: " + e.awsErrorDetails().errorMessage(), e);
        }
    }
}
