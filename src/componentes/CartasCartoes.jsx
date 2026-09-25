import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";

import {
  FaAddressCard,
  FaCheckCircle,
  FaFilePdf,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const MODELOS_CARTA = [
  {
    id: "modelo1",
    nome: "Modelo 1",
    descricao:
      "Modelo branco e elegante, com cabeçalho centralizado e detalhes discretos.",
    destaque: "Clássico",
    cor: "blue",
  },
  {
    id: "modelo2",
    nome: "Modelo 2",
    descricao:
      "Modelo bege com visual moderno, formas decorativas e acabamento sofisticado.",
    destaque: "Moderno",
    cor: "orange",
  },
  {
    id: "modelo3",
    nome: "Modelo 3",
    descricao:
      "Modelo claro com moldura dourada e aparência cerimonial.",
    destaque: "Dourado",
    cor: "yellow",
  },
];

const TIPOS_CARTA = [
  {
    id: "mudanca",
    nome: "Carta de Mudança",
    descricao:
      "Usada para transferir o membro para outra igreja.",
  },
  {
    id: "recomendacao",
    nome: "Carta de Recomendação",
    descricao:
      "Usada para apresentar e recomendar o membro a outra igreja.",
  },
];

const normalizarTexto = (texto = "") => {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const limparNomeArquivo = (nome = "membro") => {
  return (
    normalizarTexto(nome)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "membro"
  );
};

const obterMensagemErro = async (
  error,
  mensagemPadrao
) => {
  try {
    const dados = error.response?.data;

    if (dados instanceof Blob) {
      const texto = await dados.text();

      try {
        const json = JSON.parse(texto);

        return (
          json.message ||
          json.error ||
          mensagemPadrao
        );
      } catch {
        return texto || mensagemPadrao;
      }
    }

    return (
      dados?.message ||
      dados?.error ||
      error.message ||
      mensagemPadrao
    );
  } catch {
    return mensagemPadrao;
  }
};

const CartasCartoes = () => {
  const [membros, setMembros] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] =
    useState(true);

  const [
    gerandoDocumento,
    setGerandoDocumento,
  ] = useState("");

  const [
    membroSelecionado,
    setMembroSelecionado,
  ] = useState(null);

  const [
    modeloSelecionado,
    setModeloSelecionado,
  ] = useState("modelo1");

  const [
    tipoCarta,
    setTipoCarta,
  ] = useState("mudanca");

  const [
    igrejaDestino,
    setIgrejaDestino,
  ] = useState("");

  const [
    cidadeDestino,
    setCidadeDestino,
  ] = useState("");

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const toast = useToast();

  const idIgreja =
    sessionStorage.getItem("idIgreja") || "";

  // =====================================================
  // CARREGAR MEMBROS
  // =====================================================

  const carregarMembros = useCallback(
    async () => {
      if (!idIgreja) {
        setMembros([]);
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);

        const response = await axios.get(
          `${API_URL}/api/users`,
          {
            headers: {
              "X-Igreja-Id": idIgreja,
            },
          }
        );

        setMembros(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Erro ao carregar membros:",
          error
        );

        setMembros([]);

        toast({
          title:
            "Erro ao carregar membros",
          description:
            error.response?.data?.message ||
            "Não foi possível carregar os membros da igreja.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setCarregando(false);
      }
    },
    [idIgreja, toast]
  );

  useEffect(() => {
    carregarMembros();
  }, [carregarMembros]);

  // =====================================================
  // FILTRAR MEMBROS
  // =====================================================

  const membrosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    if (!termo) {
      return membros;
    }

    const termoNumerico =
      termo.replace(/\D/g, "");

    return membros.filter((membro) => {
      const nome = normalizarTexto(
        membro.nome
      );

      const cpf = normalizarTexto(
        membro.cpf
      );

      const cpfNumerico = cpf.replace(
        /\D/g,
        ""
      );

      const numeroMembro =
        normalizarTexto(
          membro.numeroMembro ||
            membro.numero ||
            membro.matricula
        );

      return (
        nome.includes(termo) ||
        cpf.includes(termo) ||
        numeroMembro.includes(termo) ||
        Boolean(
          termoNumerico &&
            cpfNumerico.includes(
              termoNumerico
            )
        )
      );
    });
  }, [membros, busca]);

  // =====================================================
  // LIMPAR MODAL
  // =====================================================

  const limparDadosModal = () => {
    setMembroSelecionado(null);
    setModeloSelecionado("modelo1");
    setTipoCarta("mudanca");
    setIgrejaDestino("");
    setCidadeDestino("");
  };

  // =====================================================
  // ABRIR MODELOS
  // =====================================================

  const abrirModelosCarta = (membro) => {
    setMembroSelecionado(membro);
    setModeloSelecionado("modelo1");
    setTipoCarta("mudanca");
    setIgrejaDestino("");
    setCidadeDestino("");
    onOpen();
  };

  // =====================================================
  // FECHAR MODAL
  // =====================================================

  const fecharModal = () => {
    if (gerandoDocumento) {
      return;
    }

    limparDadosModal();
    onClose();
  };

  // =====================================================
  // GERAR CARTA
  // =====================================================

  const gerarCarta = async () => {
    if (!membroSelecionado?._id) {
      toast({
        title: "Membro não selecionado",
        description:
          "Selecione um membro para gerar a carta.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!tipoCarta) {
      toast({
        title:
          "Tipo de carta não selecionado",
        description:
          "Escolha o tipo de carta.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!igrejaDestino.trim()) {
      toast({
        title:
          "Igreja de destino não informada",
        description:
          "Informe o nome da igreja que receberá o membro.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!cidadeDestino.trim()) {
      toast({
        title:
          "Cidade de destino não informada",
        description:
          "Informe a cidade e o estado da igreja de destino.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!modeloSelecionado) {
      toast({
        title:
          "Modelo não selecionado",
        description:
          "Escolha um modelo de carta.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    const membroId =
      membroSelecionado._id;

    const identificador =
      `${tipoCarta}-${membroId}-${modeloSelecionado}`;

    try {
      setGerandoDocumento(
        identificador
      );

      const response = await axios.get(
        `${API_URL}/api/users/${membroId}/carta/${modeloSelecionado}`,
        {
          headers: {
            "X-Igreja-Id": idIgreja,
          },

          params: {
            tipoCarta,
            igrejaDestino:
              igrejaDestino.trim(),
            cidadeDestino:
              cidadeDestino.trim(),
          },

          responseType: "blob",
        }
      );

      const contentType =
        response.headers[
          "content-type"
        ] || "";

      if (
        !contentType.includes(
          "application/pdf"
        )
      ) {
        const erro = new Error(
          "O backend não retornou um arquivo PDF."
        );

        erro.response = response;

        throw erro;
      }

      const arquivo = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(
          arquivo
        );

      const link =
        document.createElement("a");

      const nomeMembro =
        limparNomeArquivo(
          membroSelecionado.nome
        );

      link.href = url;

      link.download =
        `${tipoCarta}-${nomeMembro}-${modeloSelecionado}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      toast({
        title: "Carta gerada",
        description:
          "O download da carta foi iniciado.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      limparDadosModal();
    } catch (error) {
      console.error(
        "Erro ao gerar carta:",
        error
      );

      const mensagem =
        await obterMensagemErro(
          error,
          "Não foi possível gerar a carta."
        );

      toast({
        title: "Erro ao gerar carta",
        description: mensagem,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setGerandoDocumento("");
    }
  };

  const cartaSendoGerada =
    Boolean(gerandoDocumento);

  const tipoAtual =
    TIPOS_CARTA.find(
      (tipo) =>
        tipo.id === tipoCarta
    ) || TIPOS_CARTA[0];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <Box
        w="100%"
        maxW="1200px"
        mx="auto"
        px={{
          base: 3,
          sm: 4,
          md: 6,
          lg: 8,
        }}
        py={{
          base: 4,
          md: 6,
          lg: 8,
        }}
      >

        {/* ================================================= */}
        {/* CABEÇALHO */}
        {/* ================================================= */}

        <Flex
          justify="space-between"
          align={{
            base: "stretch",
            md: "center",
          }}
          direction={{
            base: "column",
            md: "row",
          }}
          gap={4}
          mb={6}
        >

          <Box>
            <Heading
              mb={2}
              color="blue.600"
              fontSize={{
                base: "2xl",
                sm: "3xl",
                md: "4xl",
              }}
              lineHeight="1.2"
            >
              Cartas e cartões
            </Heading>

            <Text
              color="gray.600"
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              Pesquise um membro e escolha
              o documento que deseja gerar.
            </Text>
          </Box>

          <Badge
            alignSelf={{
              base: "flex-start",
              md: "center",
            }}
            colorScheme="blue"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
          >
            {membros.length}{" "}
            {membros.length === 1
              ? "membro"
              : "membros"}
          </Badge>

        </Flex>

        {/* ================================================= */}
        {/* PESQUISA */}
        {/* ================================================= */}

        <InputGroup
          w="100%"
          maxW="650px"
          mb={6}
        >
          <InputLeftElement
            pointerEvents="none"
          >
            <SearchIcon
              color="gray.500"
            />
          </InputLeftElement>

          <Input
            bg="white"
            h={{
              base: "46px",
              md: "44px",
            }}
            pl={10}
            placeholder="Buscar por nome, CPF ou número de membro"
            value={busca}
            onChange={(event) =>
              setBusca(
                event.target.value
              )
            }
          />
        </InputGroup>

        {/* ================================================= */}
        {/* CARREGANDO */}
        {/* ================================================= */}

        {carregando ? (
          <Flex
            justify="center"
            align="center"
            minH={{
              base: "180px",
              md: "250px",
            }}
          >
            <Spinner
              size="xl"
              color="blue.500"
            />
          </Flex>
        ) : membrosFiltrados.length ===
          0 ? (

          /* ================================================= */
          /* NENHUM MEMBRO */
          /* ================================================= */

          <Box
            bg="white"
            borderWidth="1px"
            borderRadius="lg"
            p={{
              base: 6,
              md: 8,
            }}
            textAlign="center"
          >
            <Text
              fontWeight="bold"
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              Nenhum membro encontrado.
            </Text>
          </Box>

        ) : (

          /* ================================================= */
          /* LISTA DE MEMBROS */
          /* ================================================= */

          <Grid
            templateColumns={{
              base: "1fr",
              lg: "repeat(2, 1fr)",
            }}
            gap={{
              base: 3,
              md: 4,
            }}
          >

            {membrosFiltrados.map(
              (membro) => (

                <Box
                  key={membro._id}
                  bg="white"
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="sm"
                  p={{
                    base: 4,
                    md: 5,
                  }}
                >

                  <Flex
                    justify="space-between"
                    align={{
                      base: "stretch",
                      sm: "center",
                    }}
                    direction={{
                      base: "column",
                      sm: "row",
                    }}
                    gap={4}
                  >

                    {/* DADOS DO MEMBRO */}

                    <Box
                      minW={0}
                      flex="1"
                    >
                      <Text
                        fontSize={{
                          base: "md",
                          md: "lg",
                        }}
                        fontWeight="bold"
                        wordBreak="break-word"
                      >
                        {membro.nome}
                      </Text>

                      <Text
                        fontSize="sm"
                        color={
                          membro.ativo ===
                          false
                            ? "red.600"
                            : "green.600"
                        }
                        fontWeight="bold"
                        mt={1}
                      >
                        {membro.ativo ===
                        false
                          ? "Inativo"
                          : "Ativo"}
                      </Text>

                      {membro.cpf && (
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          mt={1}
                          wordBreak="break-word"
                        >
                          CPF:{" "}
                          {membro.cpf}
                        </Text>
                      )}
                    </Box>

                    {/* BOTÕES */}

                    <Flex
                      gap={2}
                      w={{
                        base: "100%",
                        sm: "auto",
                      }}
                      direction={{
                        base: "column",
                        sm: "row",
                      }}
                    >

                      <Button
                        size={{
                          base: "md",
                          sm: "sm",
                        }}
                        colorScheme="blue"
                        leftIcon={
                          <FaFilePdf />
                        }
                        onClick={() =>
                          abrirModelosCarta(
                            membro
                          )
                        }
                        w={{
                          base: "100%",
                          sm: "auto",
                        }}
                      >
                        Gerar carta
                      </Button>

                      <Button
                        size={{
                          base: "md",
                          sm: "sm",
                        }}
                        colorScheme="yellow"
                        leftIcon={
                          <FaAddressCard />
                        }
                        isDisabled
                        w={{
                          base: "100%",
                          sm: "auto",
                        }}
                      >
                        Gerar cartão
                      </Button>

                    </Flex>

                  </Flex>

                </Box>

              )
            )}

          </Grid>

        )}

      </Box>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <Modal
        isOpen={isOpen}
        onClose={fecharModal}
        size={{
          base: "full",
          md: "4xl",
        }}
        isCentered
        scrollBehavior="inside"
        closeOnOverlayClick={
          !cartaSendoGerada
        }
        closeOnEsc={
          !cartaSendoGerada
        }
      >

        <ModalOverlay />

        <ModalContent
          mx={{
            base: 0,
            sm: 2,
            md: 4,
          }}
          my={{
            base: 0,
            md: 6,
          }}
          borderRadius={{
            base: 0,
            sm: "lg",
          }}
          maxH={{
            base: "100vh",
            md: "90vh",
          }}
        >

          <ModalHeader
            fontSize={{
              base: "lg",
              md: "xl",
            }}
            pr={12}
          >
            Gerar documento
          </ModalHeader>

          {!cartaSendoGerada && (
            <ModalCloseButton />
          )}

          <ModalBody
            px={{
              base: 4,
              sm: 5,
              md: 6,
            }}
            pb={6}
          >

            {/* MEMBRO SELECIONADO */}

            {membroSelecionado && (
              <Box
                bg="blue.50"
                borderRadius="md"
                p={{
                  base: 3,
                  md: 4,
                }}
                mb={5}
              >
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Documento para:
                </Text>

                <Text
                  fontSize={{
                    base: "md",
                    md: "lg",
                  }}
                  fontWeight="bold"
                  color="blue.700"
                  wordBreak="break-word"
                >
                  {
                    membroSelecionado.nome
                  }
                </Text>
              </Box>
            )}

            {/* ================================================= */}
            {/* TIPO DE CARTA */}
            {/* ================================================= */}

            <FormControl mb={6}>
              <FormLabel
                fontWeight="bold"
              >
                Tipo de carta
              </FormLabel>

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={3}
              >

                {TIPOS_CARTA.map(
                  (tipo) => {

                    const selecionado =
                      tipoCarta ===
                      tipo.id;

                    return (
                      <Box
                        key={tipo.id}
                        borderWidth="2px"
                        borderColor={
                          selecionado
                            ? "blue.500"
                            : "gray.200"
                        }
                        bg={
                          selecionado
                            ? "blue.50"
                            : "white"
                        }
                        borderRadius="lg"
                        p={{
                          base: 4,
                          md: 5,
                        }}
                        cursor={
                          cartaSendoGerada
                            ? "not-allowed"
                            : "pointer"
                        }
                        position="relative"
                        minH={{
                          base: "auto",
                          md: "150px",
                        }}
                        onClick={() => {
                          if (
                            !cartaSendoGerada
                          ) {
                            setTipoCarta(
                              tipo.id
                            );
                          }
                        }}
                        _hover={{
                          borderColor:
                            cartaSendoGerada
                              ? undefined
                              : "blue.300",
                        }}
                      >

                        {selecionado && (
                          <Box
                            position="absolute"
                            top={3}
                            right={3}
                            color="blue.500"
                          >
                            <FaCheckCircle
                              size={20}
                            />
                          </Box>
                        )}

                        <Text
                          fontWeight="bold"
                          mb={2}
                          pr={8}
                        >
                          {tipo.nome}
                        </Text>

                        <Text
                          fontSize="sm"
                          color="gray.600"
                          pr={5}
                          lineHeight="1.5"
                        >
                          {tipo.descricao}
                        </Text>

                      </Box>
                    );
                  }
                )}

              </Grid>
            </FormControl>

            {/* ================================================= */}
            {/* DESTINO */}
            {/* ================================================= */}

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={4}
              mb={6}
            >

              <FormControl
                isRequired
              >
                <FormLabel>
                  Igreja de destino
                </FormLabel>

                <Input
                  h="46px"
                  placeholder="Ex.: Assembleia de Deus Ministério Moriáh"
                  value={igrejaDestino}
                  onChange={(event) =>
                    setIgrejaDestino(
                      event.target.value
                    )
                  }
                  isDisabled={
                    cartaSendoGerada
                  }
                />
              </FormControl>

              <FormControl
                isRequired
              >
                <FormLabel>
                  Cidade e estado
                </FormLabel>

                <Input
                  h="46px"
                  placeholder="Ex.: Peruíbe/SP"
                  value={cidadeDestino}
                  onChange={(event) =>
                    setCidadeDestino(
                      event.target.value
                    )
                  }
                  isDisabled={
                    cartaSendoGerada
                  }
                />
              </FormControl>

            </Grid>

            {/* ================================================= */}
            {/* MODELOS */}
            {/* ================================================= */}

            <Text
              fontWeight="bold"
              fontSize={{
                base: "md",
                md: "lg",
              }}
              mb={3}
            >
              Escolha o modelo visual
            </Text>

            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              }}
              gap={3}
            >

              {MODELOS_CARTA.map(
                (modelo) => {

                  const selecionado =
                    modeloSelecionado ===
                    modelo.id;

                  return (
                    <Box
                      key={modelo.id}
                      position="relative"
                      borderWidth="2px"
                      borderColor={
                        selecionado
                          ? "blue.500"
                          : "gray.200"
                      }
                      bg={
                        selecionado
                          ? "blue.50"
                          : "white"
                      }
                      borderRadius="lg"
                      p={{
                        base: 4,
                        md: 4,
                      }}
                      cursor={
                        cartaSendoGerada
                          ? "not-allowed"
                          : "pointer"
                      }
                      minH={{
                        base: "auto",
                        md: "190px",
                      }}
                      onClick={() => {
                        if (
                          !cartaSendoGerada
                        ) {
                          setModeloSelecionado(
                            modelo.id
                          );
                        }
                      }}
                      _hover={{
                        borderColor:
                          cartaSendoGerada
                            ? undefined
                            : "blue.300",
                      }}
                    >

                      {selecionado && (
                        <Box
                          position="absolute"
                          top={3}
                          right={3}
                          color="blue.500"
                        >
                          <FaCheckCircle
                            size={20}
                          />
                        </Box>
                      )}

                      <Flex
                        align="center"
                        justify="center"
                        h={{
                          base: "65px",
                          md: "70px",
                        }}
                        mb={3}
                        borderRadius="md"
                        bg={
                          modelo.id ===
                          "modelo1"
                            ? "gray.50"
                            : modelo.id ===
                              "modelo2"
                            ? "orange.50"
                            : "yellow.50"
                        }
                        borderWidth="1px"
                      >
                        <FaFilePdf
                          size={32}
                        />
                      </Flex>

                      <Badge
                        colorScheme={
                          modelo.cor
                        }
                        mb={2}
                      >
                        {
                          modelo.destaque
                        }
                      </Badge>

                      <Text
                        fontWeight="bold"
                        mb={2}
                        pr={5}
                      >
                        {modelo.nome}
                      </Text>

                      <Text
                        fontSize="sm"
                        color="gray.600"
                        lineHeight="1.5"
                      >
                        {
                          modelo.descricao
                        }
                      </Text>

                    </Box>
                  );
                }
              )}

            </Grid>

          </ModalBody>

          {/* ================================================= */}
          {/* RODAPÉ DO MODAL */}
          {/* ================================================= */}

          <ModalFooter
            gap={2}
            flexDirection={{
              base: "column-reverse",
              sm: "row",
            }}
            alignItems={{
              base: "stretch",
              sm: "center",
            }}
            px={{
              base: 4,
              sm: 6,
            }}
          >

            <Button
              variant="ghost"
              onClick={fecharModal}
              isDisabled={
                cartaSendoGerada
              }
              w={{
                base: "100%",
                sm: "auto",
              }}
            >
              Cancelar
            </Button>

            <Button
              colorScheme="blue"
              leftIcon={
                <FaFilePdf />
              }
              onClick={gerarCarta}
              isLoading={
                cartaSendoGerada
              }
              loadingText="Gerando carta"
              w={{
                base: "100%",
                sm: "auto",
              }}
            >
              Gerar{" "}
              {tipoAtual.nome}
            </Button>

          </ModalFooter>

        </ModalContent>

      </Modal>
    </>
  );
};

export default CartasCartoes;