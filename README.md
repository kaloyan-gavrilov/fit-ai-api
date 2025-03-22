<p align="center">
  <img width="256px" src="./docs/logo.png" alt="FitAI Logo" />
  <h1 align="center">FitAI API</h1>
  <p align="center">
    [ <a href="https://github.com/x2oreo/FitAI">FitAI</a> ] · 
    [ <b><ins>FitAI API</ins></b> ] · 
    [ <a href="https://github.com/x2oreo/FitAI-vscode-extension">FitAI VS Code Extension</a> ]
  </p>
  <p align="center">
    FitAI is an innovative ecosystem tailored specifically for developers who face challenges balancing health with their demanding coding schedules. Our solution simplifies achieving fitness goals by providing personalized workout and meal plans, AI expert advice and integration in the VSCode ecosystem.
  </p>
</p>

<p align="center">
    <a href="https://github.com/x2oreo/fitai-api/releases">
      <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/x2oreo/fitai-api?color=88ff0c&style=flat-square">
    </a>
    <a href="https://github.com/x2oreo/fitai-api/fork">
        <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?color=88ff0c&style=flat-square" alt="Contributions welcome" />
    </a>
    <a href="LICENSE">
        <img src="https://img.shields.io/github/license/x2oreo/fitai-api?color=88ff0c&style=flat-square" alt="License" />
    </a>
</p>

---

## Getting Started

The FitAI ecosystem consists of three primary components:

- **Mobile Application** *(available at [FitAI](https://github.com/x2oreo/FitAI))*: Offers personalized meal and workout plans tailored to your available time and financial situation. You can also chat with a personal AI health assistant, which is designed specifically for programmers
- **AI Model API Server** *(this repository)*: Generates personalized fitness and meal plans based on your profile and preferences, and provides the AI chat assistant.
- **Visual Studio Code Extension** *(available at [FitAI VS Code Extension](https://github.com/x2oreo/FitAI-vscode-extension))*: Integrates health guidance directly into your coding workflow.

Each component has detailed setup instructions available in their respective repositories.

## Development

Processing of the knowledge base is done using **Python**. The AI serving API is written in **Nest.js** on **Node.js**. To build and run it locally, you need to do the following:

1. Configure Node.js 22 LTS on your machine.
2. Install the nessary packages using `npm install`.
3. Configure an `.env` file with key for AI services.
4. Run the application using `npm run start:dev`.
5. **Enjoy! 🎉**

## Authors
<table width="100%">
  <tr>
    <td align="center">
        <img width="150px" src="https://github.com/FantomJx.png" alt="Mark Danileychenko" />
        <p><b>Mark Danileychenko</b><br/><a href="https://github.com/FantomJx/"><img src="https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white" /></a></p>
    </td>
    <td align="center">
        <img width="150px" src="https://github.com/Fichoto.png" alt="Filip Mutafis" />
        <p><b>Filip Mutafis</b><br/><a href="https://github.com/Fichoto/"><img src="https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white" /></a></p>
    </td>
    <td align="center">
        <img width="150px" src="https://github.com/kaloyan-gavrilov.png" alt="Kaloyan Gavrilov" />
        <p><b>Kaloyan Gavrilov</b><br/><a href="https://github.com/kaloyan-gavrilov/"><img src="https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white" /></a></p>
    </td>
    <td align="center">
        <img width="150px" src="https://github.com/krister078.png" alt="Kristiyan Kulekov" />
        <p><b>Kristiyan Kulekov</b><br/><a href="https://github.com/krister078/"><img src="https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white" /></a></p>
    </td>
  </tr>
</table>

---

## Contribution Guidelines

We welcome contributions to the FitAI ecosystem! Follow these steps:

1. Fork the repository: <https://github.com/x2oreo/FitAI-API/fork>
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your message here"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Your contributions will be reviewed and merged promptly!

---

## License

FitAI is distributed under the MIT License. See the [LICENSE](LICENSE) file for more details.
