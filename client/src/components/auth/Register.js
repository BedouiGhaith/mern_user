import React, {Component, useState} from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import classnames from "classnames";



class Register extends Component {

  constructor() {
    super();
    this.state = {
      name: "",
      email: "",
      code: "",
      password: "",
      password2: "",
      errors: {},
      success: false,
      verified: false

    };
  }


  componentDidMount() {
    // If logged in and user navigates to Register page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange = e => {
    console.log(e.target.id)
    if ((e.target.id === "email" || e.target.id === "code" ) && this.state.verified === true) {
      // Don't update the email state value
    } else if (e.target.id === "code" && this.state.verified === false) {
      this.setState({[e.target.id]: e.target.value.toUpperCase().slice(0, 8) })
    }else {
      this.setState({[e.target.id]: e.target.value})
    };
  };

  onSubmit = e => {
    e.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };

    this.props.registerUser(newUser, this.props.history);
  };

  render() {

    const { errors } = this.state;

    const SendCodeButton = ({email}) => {
      const [response, setResponse] = useState(null);
      const [, setVerify] = useState(null);
      const [error, setError] = useState(null);


      const handleClick = async () => {
        try {
        const res = await fetch('http://localhost:5000/api/users/verify_email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
          })
        });
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        const json = await res.json();
        setResponse(json)
        this.setState({ success: true })
        } catch (err) {
        setError(err.message);
      }
    };
      const VerifyCode = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/users/verify_code/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: this.state.email,
              code: this.state.code,
            })
          });
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          const json = await res.json();
          console.log()
          setVerify(json);
          if (json!==null){
            this.setState({ verified: true })
          }
        } catch (err) {
          setError(err.message);
        }
      };
      console.log((this.state.verified))

      return (
          <div>
            {(this.state.success)?<div>
              <button
                    style={{
                      marginLeft : "50px",
                      width: "fit-content",
                      borderRadius: "3px",
                      letterSpacing: "1.5px",
                    }}
                    type="button"
                    className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                    onClick={VerifyCode}>Verify Code!</button>
                {this.state.verified && <pre>Codes Matched! Proceed To Enter The Rest Of Your Information...</pre>}
                {error && <pre>Check Your Email And Enter The Received Code!</pre>}</div>:
                <div>
                <button
                style={{
                  marginLeft : "50px",
                  width: "fit-content",
                  borderRadius: "3px",
                  letterSpacing: "1.5px",
                }}
                type="button"
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                onClick={handleClick}>Send Code</button>
            {response && <pre>Code Sent Successfully!</pre>}
            {error && <pre>Make Sure You Have Entered A Valid Email!</pre>}</div>}


          </div>
      );
    };

    const SendCodeForm = () => {

      return (
          <div>

          <div style={{ display: "flex" }} className="input-field col s12" >
            <SendCodeButton email = {this.state.email}>
            </SendCodeButton>
            <span className="red-text">{errors.code}</span>
          </div>
          </div>
      );
    };



    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Register</b> below
              </h4>
              <p className="grey-text text-darken-1">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.name}
                  error={errors.name}
                  id="name"
                  type="text"
                  className={classnames("", {
                    invalid: errors.name
                  })}
                />
                <label htmlFor="name">Name</label>
                <span className="red-text">{errors.name}</span>
              </div>
              <div className="input-field col s12">
                <input
                    onChange={this.onChange}
                    value={this.state.email}
                    error={errors.email}
                    id="email"
                    type="email"
                    className={classnames("", {
                      invalid: errors.email
                    })}
                />
                <label htmlFor="email">Email</label>
                <span className="red-text">{errors.email}</span>
              </div>
              <div style={{ display: "flex" }} className="input-field col s12" >
                <input
                    style={{textAlign:"center", fontSize:"16px", width:"136px"}}
                    onChange={this.onChange}
                    value={this.state.code}
                    id="code"
                    type="text" />
                <SendCodeForm>
                </SendCodeForm>
                <label htmlFor="code">Code</label>
                <span className="red-text">{errors.code}</span>
              </div>

                <span className="red-text">{errors.code}</span>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password
                  })}
                />
                <label htmlFor="password">Password</label>
                <span className="red-text">{errors.password}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password2}
                  error={errors.password2}
                  id="password2"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password2
                  })}
                />
                <label htmlFor="password2">Confirm Password</label>
                <span className="red-text">{errors.password2}</span>
              </div>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                    disabled={!this.state.verified}
                    title={!this.state.verified ? "Must Verify Your Email First!" : ""}
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  type="submit"
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, { registerUser })(withRouter(Register));
