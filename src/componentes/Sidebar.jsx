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

  const toggleSidebar = () => {
    setIsOpen(
      (estadoAtual) => !estadoAtual
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

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
      borderRadius="md"
      cursor="pointer"
      textDecoration="none"
      _hover={{
        bg: "blue.600",
        textDecoration: "none",
      }}
      onClick={() =>
        handleNavigation(path)
      }
    >
      {icon}

      <Text fontSize="sm">
        {label}
      </Text>
    </Link>
  );

  const renderFooter = () => (
    <Box
      textAlign="center"
      py={4}
      mt="auto"
    >
      <Divider
        borderColor="blue.300"
        mb={2}
      />

      <Text
        fontSize="sm"
        color="whiteAlpha.900"
        fontStyle="italic"
        letterSpacing="wide"
        _hover={{
          color: "white",
          transition: "0.3s",
        }}
      >
        Desenvolvido por{" "}
        <strong>
          José Elias Silva Sousa Morais
        </strong>
      </Text>

      <Text
        fontSize="xs"
        color="whiteAlpha.800"
        mt={1}
      >
        Todos os direitos reservados © 2026
      </Text>
    </Box>
  );

  const renderMenu = () => (
    <Stack
      spacing={1}
      flex="1"
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
          <MdCalendarToday
            size={18}
          />
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
          <FaAddressCard
            size={18}
          />
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
      {/* ========================= */}
      {/* BOTÃO MOBILE */}
      {/* ========================= */}

      <IconButton
        aria-label="Abrir menu"
        icon={<HamburgerIcon />}
        variant="outline"
        display={{
          base: "block",
          md: "none",
        }}
        position="fixed"
        top={4}
        left={4}
        zIndex={10}
        onClick={toggleSidebar}
      />

      {/* ========================= */}
      {/* SIDEBAR DESKTOP */}
      {/* ========================= */}

      <Box
        w="200px"
        bg="blue.500"
        color="white"
        minH="100vh"
        p={5}
        position="fixed"
        left={0}
        top={0}
        display={{
          base: "none",
          md: "flex",
        }}
        flexDirection="column"
        boxShadow="lg"
        zIndex={5}
      >
        <VStack
          spacing={8}
          align="stretch"
          flex="1"
        >
          {/* TÍTULO */}

          <Text
            fontSize="xl"
            fontWeight="bold"
            textAlign="center"
          >
            Dashboard
          </Text>

          {/* MENU */}

          {renderMenu()}

          {/* RODAPÉ */}

          <Box mt="auto">
            {renderFooter()}
          </Box>
        </VStack>
      </Box>

      {/* ========================= */}
      {/* SIDEBAR MOBILE */}
      {/* ========================= */}

      <Drawer
        placement="left"
        onClose={() =>
          setIsOpen(false)
        }
        isOpen={isOpen}
      >
        <DrawerOverlay />

        <DrawerContent>
          <DrawerBody
            bg="blue.500"
            color="white"
            p={5}
            display="flex"
            flexDirection="column"
            minH="100vh"
          >
            <VStack
              spacing={6}
              align="stretch"
              flex="1"
            >
              {/* TÍTULO */}

              <Text
                fontSize="xl"
                fontWeight="bold"
                textAlign="center"
              >
                Dashboard
              </Text>

              {/* MENU */}

              {renderMenu()}

              {/* RODAPÉ */}

              <Box mt="auto">
                {renderFooter()}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;