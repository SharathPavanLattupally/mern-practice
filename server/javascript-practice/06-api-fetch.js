// Task 2: fetch API data, loading/success/error states, and JSON stringify/parse

async function fetchUsers() {
  let loading = true;
  let errorMessage = null;
  let users = [];

  console.log("Loading users...");
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    // fetch does not reject automatically for HTTP 404/500; check response.ok.
    if (!response.ok) {
      throw new Error(`Request failed with HTTP ${response.status}`);
    }

    users = await response.json();
    console.log("Success: received", users.length, "users");
    console.log("First user:", users[0]);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error loading users:", errorMessage);
  } finally {
    loading = false;
    console.log("Request state:", {
      loading,
      error: errorMessage,
      dataCount: users.length
    });
  }

  return { users, error: errorMessage };
}

function demonstrateJson() {
  const student = { id: 101, name: "Ravi", marks: 85 };
  const jsonText = JSON.stringify(student); // JavaScript object -> JSON string
  const parsedStudent = JSON.parse(jsonText); // JSON string -> JavaScript object
  console.log("JSON string:", jsonText);
  console.log("Parsed object:", parsedStudent);
}

demonstrateJson();
await fetchUsers();
