import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Heading,
  Button,
  Grid,
  Text,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

import ModalEvento from "./ModalEvento";

const API_URL = import.meta.env.VITE_API_URL;

const Eventos = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [eventos, setEventos] = useState([]);
  const [eventoEdicao, setEventoEdicao] = useState(null);

  const idIgreja = sessionStorage.getItem("idIgreja");

  // 🔹 Carregar eventos
  const carregarEventos = useCallback(async () => {
    if (!idIgreja) return;

    try {
      const response = await axios.get(`${API_URL}/api/eventos`, {
        headers: { "X-Igreja-Id": idIgreja },
      });
      setEventos(response.data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description:
          error.response?.data?.message || "Erro de conexão com o servidor",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }, [idIgreja, toast]);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  // 🔹 Excluir evento
  const excluirEvento = async (id) => {
    if (!window.confirm("Deseja realmente excluir este evento?")) return;

    try {
      await axios.delete(`${API_URL}/api/eventos/${id}`, {
        headers: { "X-Igreja-Id": idIgreja },
      });

      toast({
        title: "Evento excluído com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      carregarEventos();
    } catch (error) {
      toast({
        title: "Erro ao excluir evento",
        description:
          error.response?.data?.message || "Erro no servidor",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // 🔹 Próximo evento
  const proximoEvento = eventos
    .filter((e) => new Date(e.dataEvento) >= new Date())
    .sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento))[0];

  return (
    <Box
      w={{ base: "95%", md: "85%", lg: "80%" }}
      my={6}
      mx="auto"
      px={{ base: 2, md: 0 }}
    >
      {/* Cabeçalho */}
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={6}
      >
        <Heading
  size="lg"
  textAlign="center"
  w="100%"
>
  Eventos
</Heading>


        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          w={{ base: "100%", md: "auto" }}
          onClick={() => {
            setEventoEdicao(null);
            onOpen();
          }}
        >
          Novo Evento
        </Button>
      </Flex>

      {/* Próximo Evento */}
      <Box
        p={5}
        mb={8}
        bg="blue.50"
        borderRadius="xl"
        borderLeft="6px solid"
        borderColor="blue.500"
      >
        <Text fontWeight="bold" mb={1}>
          Próximo Evento
        </Text>

        {proximoEvento ? (
          <>
            <Text fontWeight="bold" fontSize="lg">
              {proximoEvento.nome}
            </Text>
            <Text>
              {new Date(proximoEvento.dataEvento).toLocaleDateString()} –{" "}
              {proximoEvento.horaEvento}
            </Text>
            <Text>{proximoEvento.local}</Text>
            <Text fontSize="sm" color="gray.600">
              {proximoEvento.tipo}
            </Text>
          </>
        ) : (
          <Text color="gray.500">Nenhum evento futuro cadastrado</Text>
        )}
      </Box>

      {/* Lista de Eventos */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={6}
      >
        {eventos.map((evento) => (
          <Box
            key={evento._id}
            p={5}
            borderWidth="1px"
            borderRadius="xl"
            boxShadow="md"
            bg={
              new Date(evento.dataEvento) < new Date()
                ? "gray.100"
                : "white"
            }
          >
            <Text fontWeight="bold" fontSize="lg" mb={1}>
              {evento.nome}
            </Text>

            <Text fontSize="sm">
              {new Date(evento.dataEvento).toLocaleDateString()} –{" "}
              {evento.horaEvento}
            </Text>

            <Text fontSize="sm">{evento.local}</Text>

            <Text fontSize="sm" color="gray.600" mb={3}>
              {evento.tipo}
            </Text>

            <Flex gap={2}>
              <Button
                size="sm"
                leftIcon={<EditIcon />}
                colorScheme="yellow"
                flex="1"
                onClick={() => {
                  setEventoEdicao(evento);
                  onOpen();
                }}
              >
                Editar
              </Button>

              <Button
                size="sm"
                leftIcon={<DeleteIcon />}
                colorScheme="red"
                flex="1"
                onClick={() => excluirEvento(evento._id)}
              >
                Excluir
              </Button>
            </Flex>
          </Box>
        ))}
      </Grid>

      {/* Modal Criar / Editar */}
      <ModalEvento
        isOpen={isOpen}
        onClose={onClose}
        eventoEdicao={eventoEdicao}
        carregarEventos={carregarEventos}
      />
    </Box>
  );
};

export default Eventos;
``