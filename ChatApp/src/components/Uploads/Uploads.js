import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import useAuth from "../../hooks/useAuth";

const Uploads = () => {
  const { auth } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    // Fetch the list of uploaded files
    fetch("http://localhost:3001/uploads", {
      // Adjust the URL as needed
      headers: {
        Authorization: auth.accessToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUploadedFiles(data.files); // Assuming the response has a 'files' field
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

        fetch("http://localhost:3001/upload", {
          method: "POST",
          headers: {
            Authorization: auth.accessToken, // Sending the token in the Authorization header
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
            {file.type.startsWith("image/") ? (
              <img
                src={`http://localhost:3001/uploads/${file.name}`}
                alt={file.name}
                style={styles.image}
              />
            ) : (
              <p>{file.name}</p>
            )}
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
    maxWidth: "100px",
    maxHeight: "100px",
    objectFit: "cover",
  },
};

export default Uploads;
