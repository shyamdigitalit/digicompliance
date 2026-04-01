import React from "react";
import { render } from "@react-email/render";

/* ---------------------------------------------------
   ENV + URL RESOLUTION
--------------------------------------------------- */

const resolveAppUrl = () => {
  const env = process.env.NODE_ENV;
  const appenv = process.env.APP_ENV;

  const urlMap = {
    dev: {
      quality: "http://localhost:3042",
      production: "http://localhost:3041",
    },
    live: {
      quality: "https://notify-qas.shyamgroup.com/email-assets",
      production: "https://notify.shyamgroup.com/email-assets",
    },
  };

  return urlMap?.[env]?.[appenv] || "http://localhost:3042";
};

const APP_URL = resolveAppUrl();

/* ---------------------------------------------------
   STYLES (CENTRALIZED)
--------------------------------------------------- */

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    borderRadius: "15px",
    width: "100%",
    minWidth: "800px",
    margin: "auto",
    width: "100%",
  },

  headingRow: {
    backgroundImage: "linear-gradient(to right, #ffdb79, #f1e6c7)",
    color: "crimson",
  },

  headerCell: {
    padding: "5px 40px",
    textAlign: "left",
  },

  logoCell: {
    padding: "2px 40px",
    textAlign: "center",
    verticalAlign: "middle",
    width: "40px",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  main: {
    backgroundImage: "linear-gradient(to bottom, #fcfcfc, #f0f0f0)",
  },

  paragraph: {
    padding: "20px 40px",
    color: "#076601",
    fontSize: "13px",
    lineHeight: "1.6",
    fontWeight: 600,
  },

  image: {
    width: "100%",
    height: "auto",
    aspectRatio: "1/1",
    display: "block",
  },

  footer: {
    height: "120px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
  },
};

/* ---------------------------------------------------
   LAYOUT COMPONENTS
--------------------------------------------------- */

const EmailLayout = ({ children }) => (
  <html>
    <body>
      <table style={styles.container} cellSpacing="0">
        {children}
      </table>
    </body>
  </html>
);

const EmailHeader = () => (
  <thead>
    <tr style={styles.headingRow}>
      <th style={styles.headerCell}>
        <span style={{ fontSize: "15px", fontWeight: 700 }}>Hi,</span>
      </th>
      <th style={styles.logoCell}>
        <img
          src={`${APP_URL}/shyamlogo.png`}
          alt="Logo"
          style={styles.logo}
        />
      </th>
    </tr>
  </thead>
);

const EmailBody = ({ event, imageCid }) => (
  <tbody style={styles.main}>
    <tr>
      <td colSpan={2} style={styles.paragraph}>
        {event?.title} !
      </td>
    </tr>

    {imageCid && (
      <tr>
        <td colSpan={2}>
          <img
            src={`cid:${imageCid}`}
            alt="Embedded"
            style={styles.image}
          />
        </td>
      </tr>
    )}
  </tbody>
);

const EmailFooter = () => (
  <tr>
    <td
      colSpan={2}
      style={{
        ...styles.footer,
        backgroundImage: `url(${APP_URL}/footr.png)`,
      }}
    />
  </tr>
);

/* ---------------------------------------------------
   MAIN EMAIL TEMPLATE
--------------------------------------------------- */

const EventEmailTemplate = ({ event, imageCid }) => (
  <EmailLayout>
    <EmailHeader />
    <EmailBody event={event} imageCid={imageCid} />
    <EmailFooter />
  </EmailLayout>
);

/* ---------------------------------------------------
   EXPORT RENDER FUNCTION
--------------------------------------------------- */

export const genEventnotif = async (event, imageCid) => {
  return await render(<EventEmailTemplate event={event} imageCid={imageCid} />);
};
