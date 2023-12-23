import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import useAuth from "../../hooks/useAuth";

const Uploads = () => {
  const { auth } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const deleteFile = (fileName) => {
    console.log("Delete file:", fileName);

    // Construct the URL for the delete API
    const url = `${process.env.REACT_APP_CHAT_SERVER_URL}/deleteFile/${fileName}`;

    fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: auth.accessToken, // Include the auth token if required
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("File deleted successfully:", data);
        // Optionally, update the state to remove the file from the list
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== fileName)
        );
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  };

  const renderFile = (file) => {
    const fileUrl = `${process.env.REACT_APP_CHAT_SERVER_URL}/uploads/${file.name}`;

    return (
      <div style={styles.fileItem}>
        {file.type.startsWith("image/") && (
          <img src={fileUrl} alt={file.name} style={styles.image} />
        )}
        {file.type.startsWith("video/") && (
          <video style={styles.video} controls src={fileUrl} />
        )}
        {!file.type.startsWith("image/") && !file.type.startsWith("video/") && (
          <a href={fileUrl} download style={styles.fileLink}>
            {file.name}
          </a>
        )}
        <button
          style={styles.deleteButton}
          onClick={() => deleteFile(file.name)}
        >
          X
        </button>
      </div>
    );
  };
  useEffect(() => {
    fetch(`${process.env.REACT_APP_CHAT_SERVER_URL}/uploads`, {
      headers: {
        Authorization: auth.accessToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUploadedFiles(data.files);
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
      });
  }, [auth.accessToken]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const formData = new FormData();
        formData.append("file", file);

        fetch(`${process.env.REACT_APP_CHAT_SERVER_URL}/upload`, {
          method: "POST",
          headers: {
            Authorization: auth.accessToken,
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
    },
    [auth.accessToken]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div style={styles.filesContainer}>
        {uploadedFiles.map((file, index) => (
          <div key={index} style={styles.fileItem}>
            {renderFile(file)}
          </div>
        ))}
      </div>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  dropzone: {
    border: "2px dashed #0087F7",
    borderRadius: "5px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
  },
  filesContainer: {
    marginBottom: "20px",
  },
  fileItem: {
    marginBottom: "10px",
  },
  image: {
    width: "282px",
    height: "160px",
    objectFit: "cover",
  },
  video: {
    width: "282px",
    height: "160px",
    objectFit: "cover",
  },
};

export default Uploads;
