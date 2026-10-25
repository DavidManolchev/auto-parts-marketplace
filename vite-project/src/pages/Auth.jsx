import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function AuthForm({ mode }) {
  {/*tbd*/ }
}

export const Login = () => <AuthForm mode="login" />;
export const Signup = () => <AuthForm mode="signup" />;
