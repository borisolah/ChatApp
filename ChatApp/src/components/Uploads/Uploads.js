import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import useAuth from "../../hooks/useAuth";

const Uploads = () => {
  const { auth } = useAuth();
  console.log(auth, "idemo");
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
    <div {...getRootProps()} style={styles.dropzone}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
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
};

export default Uploads;
