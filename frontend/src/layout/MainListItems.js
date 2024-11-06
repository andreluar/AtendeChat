import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge, Collapse, List } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { SocketContext } from "../context/Socket/SocketContext";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import dashboardIcon from "../assets/icons/dashboard.png";
import atendimentoIcon from "../assets/icons/atendimento.png";
import kanbanIcon from "../assets/icons/kanban.png";
import respostaIcon from "../assets/icons/resposta.png";
import tarefaIcon from "../assets/icons/tarefa.png";
import contatoIcon from "../assets/icons/contato.png";
import agendamentoIcon from "../assets/icons/agendamento.png";
import etiquetaIcon from "../assets/icons/etiqueta.png";
import chatIcon from "../assets/icons/chat.png";
import videosIcon from "../assets/icons/videos.png";
import midiaIcon from "../assets/icons/midia.png";
import chatgptIcon from "../assets/icons/chatgpt.png";
import conectIcon from "../assets/icons/conect.png";
import integrarIcon from "../assets/icons/integrar.png";
import novidadeIcon from "../assets/icons/novidade.png";
import filesIcon from "../assets/icons/files.png";
import filasIcon from "../assets/icons/filas.png";
import usuarioIcon from "../assets/icons/usuario.png";
import apiIcon from "../assets/icons/api.png";
import financeiroIcon from "../assets/icons/financeiro.png";
import configuracoesIcon from "../assets/icons/configuracoes.png";
import mkIcon from "../assets/icons/mk.png"; 
import listagemIcon from "../assets/icons/listagem.png"; 
import userIcon from "../assets/icons/user.png"; 
import logoIcon from "../assets/icons/novalogo.png"; // Import da nova logo
import usePlans from "../hooks/usePlans"; // Import do hook usePlans

const useStyles = makeStyles((theme) => ({
  ListSubheader: {
    height: 26,
    marginTop: "-15px",
    marginBottom: "-10px",
  },
  menuSuperior: {
    background: 'linear-gradient(to right, #0000ff, #ff00ff)', // Gradiente de azul para rosa pink
    color: 'white', // Para garantir que o texto continue visível
    padding: '10px' // Ajuste o padding conforme necessário
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button dense component={renderLink} className={className}>
        {icon && (
          <ListItemIcon>
            {typeof icon === 'string' ? (
              <img src={icon} alt={primary} style={{ width: 24, height: 24 }} />
            ) : (
              icon
            )}
          </ListItemIcon>
        )}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, collapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false); 
  const history = useHistory();
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();
  
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickLogout = () => {
    handleLogout();
  };

  return (
    <div className={classes.menuSuperior} onClick={drawerClose}>
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink
            to="/"
            primary="Dashboard"
            icon={<img src={dashboardIcon} alt="Dashboard Icon" style={{ width: 24, height: 24 }} />}
          />
        )}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={atendimentoIcon} 
      />
	  
	  {showKanban && (
        <ListItemLink
          to="/kanban"
          primary="Kanban CRM"
          icon={kanbanIcon} 
        />
      )}

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={respostaIcon} 
      />
	  
	  <ListItemLink
        to="/todolist"
        primary="Suas tarefas"
        icon={tarefaIcon} 
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={contatoIcon} 
      />

      <ListItemLink
        to="/schedules"
        primary={i18n.t("mainDrawer.listItems.schedules")}
        icon={<img src={agendamentoIcon} alt="Agendamento Icon" style={{ width: 24, height: 24 }} />}
      />

      <ListItemLink
        to="/tags"
        primary="Etiquetas"
        icon={<img src={etiquetaIcon} alt="Etiqueta Icon" style={{ width: 24, height: 24 }} />}
      />

      <ListItemLink
        to="/chats"
        primary={i18n.t("mainDrawer.listItems.chats")}
        icon={
          <Badge color="secondary" variant="dot" invisible={invisible}>
            <img src={chatIcon} alt="Chat Icon" style={{ width: 24, height: 24 }} />
          </Badge>
        }
      />

      <ListItemLink
        to="/helps"
        primary="Videos"
        icon={<img src={videosIcon} alt="Videos Icon" style={{ width: 24, height: 24 }} />}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader
              hidden={collapsed}
              style={{
                position: "relative",
                fontSize: "17px",
                textAlign: "left",
                paddingLeft: 20
              }}
              inset
              color="inherit">
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
			
            {showCampaigns && (
              <>
                <ListItem
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                >
                  <ListItemIcon>
                    <img src={midiaIcon} alt="Midia Icon" style={{ width: 24, height: 24 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Campanhas"
                  />
                  {openCampaignSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem onClick={() => history.push("/campaigns")} button>
                      <ListItemIcon>
                        <img src={listagemIcon} alt="Campanhas Icon" style={{ width: 24, height: 24 }} />
                      </ListItemIcon>
                      <ListItemText primary="Campanhas" />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/contact-lists")}
                      button
                    >
                      <ListItemIcon>
                        <img src={userIcon} alt="User Icon" style={{ width: 24, height: 24 }} />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/campaigns-config")}
                      button
                    >
                      <ListItemIcon>
                        <img src={mkIcon} alt="MK Icon" style={{ width: 24, height: 24 }} />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}
            {user.super && (
              <ListItemLink
                to="/announcements"
                primary="Informações"
                icon={<img src={novidadeIcon} alt="Informações Icon" style={{ width: 24, height: 24 }} />}
              />
            )}
            {showOpenAi && (
              <ListItemLink
                to="/prompts"
                primary={i18n.t("mainDrawer.listItems.prompts")}
                icon={<img src={chatgptIcon} alt="ChatGPT Icon" style={{ width: 24, height: 24 }} />}
              />
            )}

            {showIntegrations && (
              <ListItemLink
                to="/queue-integration"
                primary="Filas & Bot"
                icon={<img src={integrarIcon} alt="Integrar Icon" style={{ width: 24, height: 24 }} />}
              />
            )}
            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <img src={conectIcon} alt="Conect Icon" style={{ width: 24, height: 24 }} />
                </Badge>
              }
            />
            <ListItemLink
              to="/files"
              primary={i18n.t("mainDrawer.listItems.files")}
              icon={<img src={filesIcon} alt="Files Icon" style={{ width: 24, height: 24 }} />}
            />
            <ListItemLink
              to="/queues"
              primary="Filas"
              icon={<img src={filasIcon} alt="Filas Icon" style={{ width: 24, height: 24 }} />}
            />
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<img src={usuarioIcon} alt="Usuario Icon" style={{ width: 24, height: 24 }} />}
            />
            {showExternalApi && (
              <>
                <ListItemLink
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<img src={apiIcon} alt="API Icon" style={{ width: 24, height: 24 }} />}
                />
              </>
            )}
            <ListItemLink
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<img src={financeiroIcon} alt="Financeiro Icon" style={{ width: 24, height: 24 }} />}
            />

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<img src={configuracoesIcon} alt="Configurações Icon" style={{ width: 24, height: 24 }} />}
            />
			
            {!collapsed && <React.Fragment>
              <Divider />
              <Typography style={{ fontSize: "12px", textAlign: "center", fontWeight: "bold", marginTop: "5px" }}>
                Life Prime TI
              </Typography>
            </React.Fragment>}
			
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
