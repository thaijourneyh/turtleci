import { useEffect, useState } from "react";
import {
  useDocumentOperation,
  type DocumentActionComponent
} from "sanity";

export const explicitPublishAction: DocumentActionComponent = (props) => {
  const { publish } = useDocumentOperation(props.id, props.type);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isPublishing && !props.draft) {
      setIsPublishing(false);
      props.onComplete();
    }
  }, [isPublishing, props.draft, props.onComplete]);

  if (!props.draft) {
    return null;
  }

  return {
    label: isPublishing ? "Publishing..." : "Publish now",
    disabled: publish.disabled,
    tone: "positive",
    onHandle: () => {
      if (publish.disabled) {
        props.onComplete();
        return;
      }

      setIsPublishing(true);
      publish.execute();
    }
  };
};
