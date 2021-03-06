import { Card, Text, useQuery, useWeb3 } from "@kleros/components";
import { useRouter } from "next/router";
import { graphql } from "relay-hooks";

import SubmissionDetailsAccordion from "./submission-details-accordion";
import SubmissionDetailsCard from "./submission-details-card";
import SubmitProfileCard from "./submit-profile-card";

import { submissionStatusEnum } from "data";

export default function ProfileWithID() {
  const { props } = useQuery();
  const [accounts] = useWeb3("eth", "getAccounts");
  const { query } = useRouter();

  const reapply = query.id === "reapply";
  if (
    props &&
    accounts &&
    props.submission === null &&
    (!accounts[0] || accounts[0] === query.id || reapply)
  )
    return <SubmitProfileCard contract={props.contract} reapply={reapply} />;

  const status =
    props?.submission && submissionStatusEnum.parse(props.submission);
  const isExpired =
    status === submissionStatusEnum.Registered &&
    props?.submission &&
    Date.now() / 1000 - props.submission.submissionTime >
      props.contract.submissionDuration;
  return (
    <>
      <Card
        sx={{ marginBottom: 2 }}
        mainSx={{ justifyContent: "space-between", paddingY: 1 }}
      >
        <Text sx={{ fontWeight: "bold", minWidth: "fit-content" }}>
          Profile Status
        </Text>
        <Text>
          {status && (
            <>
              {status.startCase}
              {isExpired && " (Expired)"}{" "}
              <status.Icon
                sx={{
                  path: { fill: "text" },
                  stroke: "text",
                  strokeWidth: 0,
                }}
              />
            </>
          )}
        </Text>
      </Card>
      {props?.submission && (
        <>
          <SubmissionDetailsCard
            submission={props.submission}
            contract={props.contract}
            vouchers={props.vouchers}
          />
          <SubmissionDetailsAccordion
            submission={props.submission}
            contract={props.contract}
          />
        </>
      )}
    </>
  );
}

export const IdQuery = graphql`
  query IdQuery($id: ID!, $_id: [String!]) {
    contract(id: 0) {
      submissionDuration
      ...submitProfileCard
      ...submissionDetailsCardContract
      ...submissionDetailsAccordionContract
    }
    submission(id: $id) {
      status
      registered
      submissionTime
      disputed
      ...submissionDetailsCardSubmission
      ...submissionDetailsAccordionSubmission
    }
    vouchers: submissions(where: { vouchees_contains: $_id, usedVouch: null }) {
      ...submissionDetailsCardVouchers
    }
  }
`;
