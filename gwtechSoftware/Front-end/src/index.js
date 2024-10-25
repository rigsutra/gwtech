/*!

=========================================================
* LOTTERY Chakra - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-chakra
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-chakra/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import MainMenu from "layouts/MainMenu.js";

// import SubAdminLayout from "layouts/SubAdmin.js";
import "./index.css";

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path={`/auth`} component={AuthLayout} />
      <Route path={`/admin`} component={AdminLayout} />
      <Route path={`/subadmin`} component={AdminLayout} />
      <Route path={`/superVisor`} component={AdminLayout} />
      <Route path={`/main-menu`} component={MainMenu}/>
      <Redirect from={`/`} to="/auth/signin" />
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);
