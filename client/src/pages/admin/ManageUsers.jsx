import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleUsers } from "../../utils/mockData";

export default function ManageUsers() {
  const { data: users, error, setData } = useResource("/users", sampleUsers);

  const updateUser = async (id, field, value) => {
    await api.patch(`/users/${id}/${field}`, { [field]: value });
    setData((currentUsers) => currentUsers.map((user) => (user._id === id ? { ...user, [field]: value } : user)));
  };

  return (
    <>
      <PageHeader
        eyebrow="Account Management"
        subtitle="Admin users can update account status and role assignments."
        title="Manage Users"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "fullName", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary px-3 py-2" onClick={() => updateUser(row._id, "role", row.role === "staff" ? "user" : "staff")} type="button">
                  Toggle Staff
                </button>
                <button className="btn-secondary px-3 py-2" onClick={() => updateUser(row._id, "status", row.status === "active" ? "suspended" : "active")} type="button">
                  Toggle Status
                </button>
              </div>
            )
          }
        ]}
        rows={users}
      />
    </>
  );
}
