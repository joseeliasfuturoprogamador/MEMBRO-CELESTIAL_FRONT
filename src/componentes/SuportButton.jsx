import { Box, Link, Image, Text } from "@chakra-ui/react";

const SupportButton = () => {
  return (
    <Box 
      position="fixed" 
      bottom="30px" 
      right="30px" 
      zIndex="1000"
      textAlign="center"
    >
      <Link href="https://wa.me/98985438569" isExternal display="flex" flexDirection="column" alignItems="center">
        <Image
          src="./whatsapp-support.jpg"
          alt="Suporte via WhatsApp"
          boxSize="55px"
          borderRadius="full"
          boxShadow="lg"
          _hover={{ transform: "scale(1.1)", boxShadow: "xl" }}
          transition="0.3s"
        />
        <Text 
          mt={2} 
          fontSize="sm" 
          fontWeight="bold" 
          color="gray.700"
          bg="white"
          px={3}
          py={1}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ color: "green.600", boxShadow: "md" }}
          transition="0.3s"
        >
          Suporte Aqui!
        </Text>
      </Link>
    </Box>
  );
};

export default SupportButton;
