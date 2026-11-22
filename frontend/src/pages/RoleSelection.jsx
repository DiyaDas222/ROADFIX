import { useNavigate } from "react-router-dom";
import {
  CarFront,
  Wrench,
  ShieldCheck,
  ArrowRight,
  MapPin,
} from "lucide-react";

const roles = [
  {
    id: "customer",
    title: "Customer",
    description:
      "Get roadside assistance, find nearby mechanics and track your service.",
    icon: CarFront,
    route: "/login/customer",
  },
  {
    id: "mechanic",
    title: "Mechanic",
    description:
      "Receive service requests, navigate to customers and manage your jobs.",
    icon: Wrench,
    route: "/login/mechanic",
  },
  {
    id: "admin",
    title: "Admin",
    description:
      "Manage customers, mechanics, requests, payments, complaints and reports.",
    icon: ShieldCheck,
    route: "/login/admin",
  },
];

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-page">

      <div className="role-topbar">
        <div className="brand">
          <div className="brand-mark">
            <MapPin size={20} strokeWidth={2.5} />
          </div>

          <span>ROADFIX</span>
        </div>

        <div className="topbar-status">
          <span className="status-dot"></span>
          Roadside assistance
        </div>
      </div>

      <main className="role-content">

        <div className="role-heading">

          <p className="eyebrow">
            ROADSIDE ASSISTANCE PLATFORM
          </p>

          <h1>
            Help is closer
            <br />
            than you think.
          </h1>

          <p className="role-subtitle">
            Choose how you want to use RoadFix.
            We will take you to the right experience.
          </p>

        </div>

        <div className="role-grid">

          {roles.map((role) => {

            const Icon = role.icon;

            return (
              <button
                className={`role-card role-${role.id}`}
                key={role.id}
                onClick={() => navigate(role.route)}
              >

                <div className="role-card-top">

                  <div className="role-icon">
                    <Icon size={27} strokeWidth={2} />
                  </div>

                  <ArrowRight
                    className="role-arrow"
                    size={21}
                  />

                </div>

                <div className="role-card-body">

                  <p className="role-label">
                    {role.id === "admin"
                      ? "PLATFORM CONTROL"
                      : "ROADFIX USER"}
                  </p>

                  <h2>{role.title}</h2>

                  <p>
                    {role.description}
                  </p>

                </div>

                <div className="role-card-footer">
                  Continue as {role.title}
                  <ArrowRight size={17} />
                </div>

              </button>
            );
          })}

        </div>

        <p className="role-footer">
          RoadFix connects vehicle owners with verified roadside
          assistance providers.
        </p>

      </main>
    </div>
  );
}

export default RoleSelection;