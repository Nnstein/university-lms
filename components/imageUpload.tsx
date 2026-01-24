"use client";

import React, { useRef, useState } from "react";
import { ImageKitProvider, upload, Image as IKImage } from "@imagekit/next";
import config from "@/lib/config";
import NextImage from "next/image";
import { toast } from "@/hooks/use-toast";

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        "Authentication request failed with status code: " +
          response.status +
          " and message: " +
          errorText
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { signature, expire, token };
  } catch (error: any) {
    throw new Error("Authentication request failed: " + error.message);
  }
};

const ImageUpload = ({ onFileChange }: { onFileChange: (filePath: string) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);

    try {
      const authParams = await authenticator();

      const result = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        publicKey: config.env.imagekit.publicKey,
        signature: authParams.signature,
        expire: authParams.expire,
        token: authParams.token,
      });

      setFile({ filePath: result.filePath || "" });
      onFileChange(result.filePath || "");

      toast({
        title: "Image Uploaded Successfully",
        description: `${result.filePath} uploaded`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Image Upload Failed",
        description: `Your image could not be uploaded. Please try again. ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      <button
        type="button"
        className="upload-btn"
        disabled={uploading}
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        <NextImage
          src="/icons/upload.svg"
          alt="Upload icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-light-100 text-base">{uploading ? "Uploading..." : "Upload a file"}</p>

        {file && <p className="upload-filename">{file.filePath}</p>}

        {file && <IKImage alt={file.filePath} src={file.filePath} width={500} height={300} />}
      </button>
    </ImageKitProvider>
  );
};

export default ImageUpload;
