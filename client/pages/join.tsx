import styled from "styled-components";
import SigninSignup from "../components/SigninSignup";
import { PageWrapper } from "../components/PageWrapper";

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
`;

const H1 = styled.h1`
  margin: 0;
  color: white;
  font-size: 24px;
  @media (min-width: ${(props) => props.theme.tabletBreakpoint}) {
    font-size: 48px;
  }
`;

const JoinPage = () => {
  return (
    <PageWrapper>
      <ContentGrid>
        <TitleWrapper>
          <H1>Join the Adventure</H1>
        </TitleWrapper>
        <SigninSignup />
      </ContentGrid>
    </PageWrapper>
  );
};

export default JoinPage;
