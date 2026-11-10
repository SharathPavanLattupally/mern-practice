
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const API_URL = "http://localhost:5000";

export default function StudentFileUpload({ studentId, student }) {
  const [photo, setPhoto] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [document, setDocument] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [documentInputKey, setDocumentInputKey] = useState(0);

  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  // Load protected profile photo
  useEffect(() => {
    let objectUrl;

    async function loadPhoto() {
      if (!student?.profilePhoto?.filename || !token) {
        setPhoto(null);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/files/${studentId}/photo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load profile photo.");
        }

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);
        setPhoto(objectUrl);
      } catch (err) {
        setError(err.message);
      }
    }

    loadPhoto();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [studentId, student?.profilePhoto?.filename, token]);

  // Select profile photo
  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Select a JPG, PNG or WEBP image.");
      event.target.value = "";
      setSelectedPhoto(null);
      setPhotoPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be below 5 MB.");
      event.target.value = "";
      setSelectedPhoto(null);
      setPhotoPreview(null);
      return;
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // Select supporting document
  function handleDocumentChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Select a PDF, JPG or PNG document.");
      event.target.value = "";
      setDocument(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Document size must be below 5 MB.");
      event.target.value = "";
      setDocument(null);
      return;
    }

    setDocument(file);
  }

  // Upload photo or document
  async function uploadFile(endpoint, file, fieldName) {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      await apiRequest(endpoint, {
        method: "POST",
        body: formData,
      });

      setMessage("File uploaded successfully.");

      if (fieldName === "photo") {
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setPhotoInputKey((key) => key + 1);
      } else {
        setDocument(null);
        setDocumentInputKey((key) => key + 1);
      }

      window.location.reload();
    } catch (err) {
      setError(err.message || "File upload failed.");
    } finally {
      setLoading(false);
    }
  }

  // Remove profile photo
  async function deletePhoto() {
    if (!window.confirm("Remove profile photo?")) return;

    setLoading(true);
    setError("");

    try {
      await apiRequest(`/api/files/${studentId}/photo`, {
        method: "DELETE",
      });

      window.location.reload();
    } catch (err) {
      setError(err.message || "Failed to remove photo.");
    } finally {
      setLoading(false);
    }
  }

  // Download private document
  async function downloadDocument(documentId, filename) {
    try {
      const response = await fetch(
        `${API_URL}/api/files/${studentId}/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Document download failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = filename;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete supporting document
  async function deleteDocument(documentId) {
    if (!window.confirm("Delete this document?")) return;

    setLoading(true);
    setError("");

    try {
      await apiRequest(
        `/api/files/${studentId}/documents/${documentId}`,
        { method: "DELETE" }
      );

      window.location.reload();
    } catch (err) {
      setError(err.message || "Failed to delete document.");
    } finally {
      setLoading(false);
    }
  }

  // Clean up selected image preview
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <section className="file-upload-section">
      <h2>Student Files</h2>

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* Profile photo */}
      <h3>Profile Photo</h3>

      {photoPreview ? (
        <img
          src={photoPreview}
          alt="Selected profile"
          width="120"
        />
      ) : photo ? (
        <img
          src={photo}
          alt="Student profile"
          width="120"
        />
      ) : (
        <p>No profile photo uploaded.</p>
      )}

      <div>
        <input
          key={photoInputKey}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
        />
      </div>

      {selectedPhoto && (
        <p>Selected photo: {selectedPhoto.name}</p>
      )}

      <button
        type="button"
        disabled={loading || !selectedPhoto}
        onClick={() =>
          uploadFile(
            `/api/files/${studentId}/photo`,
            selectedPhoto,
            "photo"
          )
        }
      >
        {loading ? "Uploading..." : "Upload / Replace Photo"}
      </button>

      {student?.profilePhoto?.filename && (
        <button
          type="button"
          disabled={loading}
          onClick={deletePhoto}
        >
          Remove Photo
        </button>
      )}

      <hr />

      {/* Supporting documents */}
      <h3>Supporting Documents</h3>

      <input
        key={documentInputKey}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleDocumentChange}
      />

      {document && (
        <p>Selected document: {document.name}</p>
      )}

      <button
        type="button"
        disabled={loading || !document}
        onClick={() =>
          uploadFile(
            `/api/files/${studentId}/documents`,
            document,
            "document"
          )
        }
      >
        {loading ? "Uploading..." : "Upload Document"}
      </button>

      <h3>Uploaded Documents</h3>

      {student?.documents?.length > 0 ? (
        student.documents.map((doc) => (
          <div key={doc._id}>
            <span>{doc.originalName}</span>

            <button
              type="button"
              onClick={() =>
                downloadDocument(doc._id, doc.originalName)
              }
            >
              Download
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => deleteDocument(doc._id)}
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>No supporting documents uploaded.</p>
      )}
    </section>
  );
}
