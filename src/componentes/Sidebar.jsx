import { useState } from "react";

import {
  Box,
  VStack,
  Text,
  IconButton,
  Stack,
  Link,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  Divider,
  Flex,
} from "@chakra-ui/react";

import { HamburgerIcon } from "@chakra-ui/icons";

import {
  MdCalendarToday,
  MdDashboard,
} from "react-icons/md";

import {
  FaAddressCard,
  FaCog,
  FaDollarSign,
  FaUsers,
} from "react-icons/fa";

import { GiWaterDrop } from "react-icons/gi";

import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const fecharSidebar = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    fecharSidebar();
  };

  // =====================================================
  // ITEM DO MENU
  // =====================================================

  const MenuItem = ({
    icon,
    label,
    path,
  }) => (
    <Link
      display="flex"
      alignItems="center"
      gap={3}
      p={3}
      minH="46px"
      borderRadius="md"
      cursor="pointer"
      textDecoration="none"
      color="white"
      _hover={{
        bg: "blue.600",
        textDecoration: "none",
      }}
      _active={{
        bg: "blue.700",
      }}
      onClick={() =>
        handleNavigation(path)
      }
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minW="24px"
      >
        {icon}
      </Box>

      <Text
        fontSize="sm"
        fontWeight="medium"
        noOfLines={1}
      >
        {label}
      </Text>
    </Link>
  );

  // =====================================================
  // RODAPÉ
  // =====================================================

  const renderFooter = () => (
    <Box
      textAlign="center"
      py={4}
      mt="auto"
    >
      <Divider
        borderColor="blue.300"
        mb={3}
      />

      <Text
        fontSize="xs"
        color="whiteAlpha.900"
        fontStyle="italic"
        lineHeight="1.5"
      >
        Desenvolvido por{" "}
        <strong>
          José Elias Silva Sousa Morais
        </strong>
      </Text>

      <Text
        fontSize="xs"
        color="whiteAlpha.800"
        mt={2}
      >
        Todos os direitos reservados © 2026
      </Text>
    </Box>
  );

  // =====================================================
  // MENU
  // =====================================================

  const renderMenu = () => (
    <Stack
      spacing={1}
      flex="1"
      overflowY="auto"
      pr={1}
    >
      {/* INÍCIO */}

      <MenuItem
        icon={
          <MdDashboard size={20} />
        }
        label="Início"
        path="/"
      />

      {/* MEMBROS */}

      <MenuItem
        icon={
          <FaUsers size={18} />
        }
        label="Membros"
        path="/membros"
      />

      {/* DÍZIMOS */}

      <MenuItem
        icon={
          <FaDollarSign size={18} />
        }
        label="Dízimos"
        path="/dizimos"
      />

      {/* EVENTOS */}

      <MenuItem
        icon={
          <MdCalendarToday size={18} />
        }
        label="Eventos"
        path="/eventos"
      />

      {/* BATISMO */}

      <MenuItem
        icon={
          <GiWaterDrop size={18} />
        }
        label="Batismo"
        path="/batismo"
      />

      {/* CARTAS E CARTÕES */}

      <MenuItem
        icon={
          <FaAddressCard size={18} />
        }
        label="Cartas e cartões"
        path="/cartas-cartoes"
      />

      {/* CONFIGURAÇÕES */}

      <MenuItem
        icon={
          <FaCog size={18} />
        }
        label="Configurações"
        path="/configuracoes"
      />
    </Stack>
  );

  return (
    <>
      {/* ================================================= */}
      {/* BOTÃO DO MENU MOBILE */}
      {/* ================================================= */}

      <IconButton
        aria-label="Abrir menu"
        icon={<HamburgerIcon boxSize={6} />}
        colorScheme="blue"
        size="md"
        display={{
          base: "flex",
          md: "none",
        }}
        position="fixed"
        top={3}
        left={3}
        zIndex={1000}
        borderRadius="md"
        boxShadow="lg"
        onClick={() =>
          setIsOpen(true)
        }
      />

      {/* ================================================= */}
      {/* SIDEBAR DESKTOP */}
      {/* ================================================= */}

      <Box
        w="220px"
        flexShrink={0}
        bg="blue.500"
        color="white"
        minH="100vh"
        p={4}
        position="fixed"
        left={0}
        top={0}
        display={{
          base: "none",
          md: "flex",
        }}
        flexDirection="column"
        boxShadow="lg"
        zIndex={900}
      >
        <VStack
          spacing={6}
          align="stretch"
          h="100%"
        >
          {/* TÍTULO */}

          <Flex
            justify="center"
            align="center"
            minH="50px"
          >
            <Text
              fontSize="xl"
              fontWeight="bold"
              textAlign="center"
            >
              Dashboard
            </Text>
          </Flex>

          {/* LINHA */}

          <Divider
            borderColor="blue.300"
          />

          {/* MENU */}

          {renderMenu()}

          {/* RODAPÉ */}

          {renderFooter()}
        </VStack>
      </Box>

      {/* ================================================= */}
      {/* MENU MOBILE */}
      {/* ================================================= */}

      <Drawer
        placement="left"
        onClose={fecharSidebar}
        isOpen={isOpen}
        size="xs"
      >
        <DrawerOverlay />

        <DrawerContent
          bg="blue.500"
          color="white"
          maxW="280px"
        >

          <DrawerBody
            p={4}
            display="flex"
            flexDirection="column"
            minH="100vh"
          >

            <VStack
              spacing={5}
              align="stretch"
              h="100%"
            >

              {/* CABEÇALHO MOBILE */}

              <Flex
                justify="space-between"
                align="center"
                minH="50px"
              >

                <Text
                  fontSize="xl"
                  fontWeight="bold"
                >
                  Dashboard
                </Text>

                <IconButton
                  aria-label="Fechar menu"
                  icon={
                    <Text
                      fontSize="2xl"
                      lineHeight="1"
                    >
                      ×
                    </Text>
                  }
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{
                    bg: "blue.600",
                  }}
                  onClick={fecharSidebar}
                />

              </Flex>

              <Divider
                borderColor="blue.300"
              />

              {/* MENU */}

              {renderMenu()}

              {/* RODAPÉ */}

              {renderFooter()}

            </VStack>

          </DrawerBody>

        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;