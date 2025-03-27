import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
//import { Button} from 'reactstrap';
import { withRouter } from "react-router-dom";
import { useLocation } from "react-router-dom";
import s from "./Sidebar.module.scss";
import LinksGroup from "./LinksGroup/LinksGroup.js";
import { changeActiveSidebarItem } from "../../actions/navigation.js";
import SofiaLogo from "../Icons/SofiaLogo.js";
import cn from "classnames";
import ChatGPT from "../../pages/chat/Chatgpt.js";

const Sidebar = (props) => {
  const { activeItem = "", ...restProps } = props;

  const [burgerSidebarOpen, setBurgerSidebarOpen] = useState(false);

  const location = useLocation();
  const isChatGPT = location.pathname === "/template/chatgpt";

  useEffect(() => {
    if (props.sidebarOpened) {
      setBurgerSidebarOpen(true);
    } else {
      setTimeout(() => {
        setBurgerSidebarOpen(false);
      }, 0);
    }
  }, [props.sidebarOpened]);

  return (
    <nav className={cn(s.root, { [s.sidebarOpen]: burgerSidebarOpen })}>
      <header className={s.logo}>
        <SofiaLogo />
        <span className={s.title}>SMEC</span>
      </header>
      <ul className={s.nav}>
        <LinksGroup
          onActiveSidebarItemChange={(activeItem) =>
            props.dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={props.activeItem}
          header="HOME"
          isHeader
          iconName={<i className={"eva eva-home-outline"} />}
          link="/template/dashboard"
          index="dashboard"
        />
        <h5 className={s.navTitle}>Content</h5>
        <LinksGroup
          onActiveSidebarItemChange={(activeItem) =>
            props.dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={props.activeItem}
          header="CHATBOT"
          isHeader
          iconName={<i className={"eva eva-message-circle-outline"} />}
          link="/template/chatgpt"
          index="chatgpt"
        />
        <LinksGroup
          onActiveSidebarItemChange={(activeItem) =>
            props.dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={props.activeItem}
          header="Typography"
          isHeader
          iconName={<i className={"eva eva-text-outline"} />}
          link="/template/typography"
          index="typography"
        />
        <LinksGroup
          onActiveSidebarItemChange={(activeItem) =>
            props.dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={props.activeItem}
          header="Tables"
          isHeader
          iconName={<i className={"eva eva-grid-outline"} />}
          link="/template/tables"
          index="tables"
        />
        <LinksGroup
          onActiveSidebarItemChange={(activeItem) =>
            props.dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={props.activeItem}
          header="Notifications"
          isHeader
          iconName={<i className={"eva eva-bell-outline"} />}
          link="/template/notifications"
          index="notifications"
        />
        <LinksGroup
          onActiveSidebarItemChange={(activeItem) =>
            props.dispatch(changeActiveSidebarItem(activeItem))
          }
          activeItem={props.activeItem}
          header="UI Elements"
          isHeader
          iconName={<i className={"eva eva-cube-outline"} />}
          link="/template/uielements"
          index="uielements"
          childrenLinks={[
            {
              header: "Charts",
              link: "/template/ui-elements/charts",
            },
            {
              header: "Icons",
              link: "/template/ui-elements/icons",
            },
            {
              header: "Google Maps",
              link: "/template/ui-elements/maps",
            },
          ]}
        />
      </ul>
      {isChatGPT && (
        <div className={s.chatList}>
          <h6 className="mt-3 mb-2 ml-3 text-muted">📄 채팅 목록</h6>
          <ul className="pl-3 pr-3">
            {(JSON.parse(localStorage.getItem("chatList")) || []).map(
              (chat) => (
                <li
                  key={chat.id}
                  onClick={() => {
                    localStorage.setItem("currentChat", chat.id); // 선택한 세션 ID 저장
                    window.location.reload(); // 새로고침 시 ChatGPT.js가 이 세션 ID 불러옴
                  }}
                  style={{
                    cursor: "pointer",
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  {chat.title}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* <div className="bg-widget d-flex mt-auto ml-1">
        <Button className="rounded-pill my-3 body-2 d-none d-md-block" type="submit" color="secondary-red">Unlock Full Version</Button>
      </div> */}
    </nav>
  );
};

Sidebar.propTypes = {
  sidebarOpened: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  activeItem: PropTypes.string,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    activeItem: store.navigation.activeItem,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
