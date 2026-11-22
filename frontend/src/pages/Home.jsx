import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="roadfix-home">

      <header className="home-header">

        <div
          className="home-logo"
          onClick={() => navigate("/")}
        >
          <div className="logo-icon">
            R
          </div>

          <div className="logo-text">
            <span className="logo-main">
              RoadFix
            </span>

            <span className="logo-tagline">
              Roadside Assistance
            </span>
          </div>
        </div>

      </header>


      <main className="home-main">

        <section className="home-intro">

          <div className="welcome-badge">
            🚗 Roadside Assistance Platform
          </div>

          <h1>
            Welcome to
            <span> RoadFix.</span>
          </h1>

          <p>
            Choose how you want to access RoadFix.
            Get roadside assistance, provide
            professional mechanic services, or
            manage the platform.
          </p>

        </section>


        <section className="role-section">

          <h2>
            Choose your account type
          </h2>

          <div className="role-cards">

            {/* CUSTOMER */}

            <button
              className="role-card"
              onClick={() =>
                navigate("/login/customer")
              }
            >

              <div className="role-icon customer-icon">
                🚘
              </div>

              <div className="role-content">

                <h3>
                  Customer
                </h3>

                <p>
                  Need roadside assistance?
                  Request a mechanic, track your
                  service and manage your vehicle.
                </p>

                <span className="role-action">
                  Login as Customer →
                </span>

              </div>

            </button>


            {/* MECHANIC */}

            <button
              className="role-card"
              onClick={() =>
                navigate("/login/mechanic")
              }
            >

              <div className="role-icon mechanic-icon">
                🔧
              </div>

              <div className="role-content">

                <h3>
                  Mechanic
                </h3>

                <p>
                  Receive roadside assistance
                  requests, manage jobs and help
                  customers on the road.
                </p>

                <span className="role-action">
                  Login as Mechanic →
                </span>

              </div>

            </button>


            {/* ADMIN */}

            <button
              className="role-card"
              onClick={() =>
                navigate("/login/admin")
              }
            >

              <div className="role-icon admin-icon">
                🛡️
              </div>

              <div className="role-content">

                <h3>
                  Admin
                </h3>

                <p>
                  Manage customers, mechanics,
                  service requests, payments and
                  the RoadFix platform.
                </p>

                <span className="role-action">
                  Login as Admin →
                </span>

              </div>

            </button>

          </div>

        </section>

      </main>


      <footer className="home-footer">

        <p>
          © {new Date().getFullYear()} RoadFix
        </p>

        <p>
          Reliable help when you need it most.
        </p>

      </footer>

    </div>
  );
}

export default Home;