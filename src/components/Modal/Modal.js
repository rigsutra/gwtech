import React from "react";
import {
  Button,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

export default function Modal({
  isOpen,
  onClose,
  title,
  submitButtonText,
  onSubmit,
  cancelButtonText,
  onCancel,
  children,
  size = "md",
}) {
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          {submitButtonText ? (
            <Button colorScheme="blue" mr={3} onClick={onSubmit}>
              {submitButtonText}
            </Button>
          ) : (
            <></>
          )}
          {cancelButtonText ? (
            <Button variant="ghost" onClick={onCancel}>
              {cancelButtonText}
            </Button>
          ) : (
            <></>
          )}
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
}
