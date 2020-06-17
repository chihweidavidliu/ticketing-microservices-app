import styled from "styled-components";
import { NextPage, NextPageContext } from "next";
import { PageWrapper } from "../components/PageWrapper";
import buildClient from "../api/buildClient";
import { FadeIn } from "../components/FadeIn";

const ContentGrid = styled.div`
  width: 90%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content 1fr;
  grid-gap: 20px;

  @media (min-width: ${(props) => props.theme.tabletBreakpoint}) {
    width: 400px;
  }
`;

const TitleWrapper = styled.div`
  text-align: center;
  padding: 30px;
  color: white;
`;

const H1 = styled.h1`
  margin: 0;
  color: white;
  font-size: 48px;
  @media (min-width: ${(props) => props.theme.tabletBreakpoint}) {
    font-size: 64px;
  }
`;

interface IIndexPageProps {
  currentUser: { id: string; email: string } | null;
}

const IndexPage: NextPage<IIndexPageProps> = ({ currentUser }) => {
  return (
    <PageWrapper>
      <FadeIn>
        <ContentGrid>
          <TitleWrapper>
            <H1>Welcome</H1>
            <p>{currentUser ? "You are signed in" : "You are not signed in"}</p>
          </TitleWrapper>
        </ContentGrid>
      </FadeIn>
    </PageWrapper>
  );
};

IndexPage.getInitialProps = async (context: NextPageContext) => {
  // build preconfigured axios instance depending on whether we are running on the server or in the browser
  const axiosClient = buildClient(context);
  const { data } = await axiosClient.get("/api/users/currentUser");
  return data;
};

export default IndexPage;
