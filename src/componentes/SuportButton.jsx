import { Box, Link, Image, Text } from "@chakra-ui/react";

const SupportButton = () => {
  return (
    <Box
      position="fixed"
      bottom={{ base: "18px", sm: "22px", md: "30px" }}
      right={{ base: "14px", sm: "20px", md: "30px" }}
      zIndex={1000}
      textAlign="center"
      animation="flutuar 2.5s ease-in-out infinite"
      sx={{
        "@keyframes flutuar": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-7px)",
          },
        },
      }}
    >
      <Link
        href="https://wa.me/98985438569"
        isExternal
        display="flex"
        flexDirection="column"
        alignItems="center"
        textDecoration="none"
        _hover={{
          textDecoration: "none",
        }}
      >
        {/* BOTÃO DO WHATSAPP */}
        <Box
          position="relative"
          borderRadius="full"
          p="2px"
          bg="white"
          boxShadow="0 4px 14px rgba(0, 0, 0, 0.25)"
          transition="all 0.25s ease"
          _hover={{
            transform: "scale(1.12)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
          }}
        >
          <Image
            src="./whatsapp-support.jpg"
            alt="Suporte via WhatsApp"
            boxSize={{
              base: "48px",
              sm: "54px",
              md: "60px",
            }}
            borderRadius="full"
            objectFit="cover"
          />

          {/* PONTO VERDE ONLINE */}
          <Box
            position="absolute"
            bottom="2px"
            right="2px"
            boxSize={{
              base: "11px",
              md: "13px",
            }}
            bg="green.400"
            border="2px solid white"
            borderRadius="full"
            boxShadow="sm"
          />
        </Box>

        {/* TEXTO */}
        <Text
          mt={{ base: 1, md: 2 }}
          fontSize={{
            base: "xs",
            sm: "sm",
            md: "sm",
          }}
          fontWeight="bold"
          color="gray.700"
          bg="white"
          px={{ base: 2, md: 3 }}
          py={{ base: "3px", md: 1 }}
          borderRadius="md"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.15)"
          whiteSpace="nowrap"
          transition="all 0.25s ease"
          _hover={{
            color: "green.600",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          Suporte Aqui!
        </Text>
      </Link>
    </Box>
  );
};

export default SupportButton;