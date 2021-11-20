import React from 'react';
import { Box, Grid, Typography, Link } from '@mui/material';
import aboutImage from './about.svg';

function About() {
  return (
    <Box
      sx={{
        py: { xs: 2, md: 3 },
        px: { xs: 1, md: 3 },
      }}
    >
      <Grid container spacing={2} direction="column">
        <Grid item sx={{ textAlign: 'center' }}>
          <img src={aboutImage} alt="about" height="250" />
        </Grid>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            About
          </Typography>
          <Typography gutterBottom>
            WCA Live is an official platform for running{' '}
            <Link
              href="https://en.wikipedia.org/wiki/Speedcubing"
              underline="hover"
            >
              Speedcubing
            </Link>{' '}
            competitions governed by the{' '}
            <Link
              href="https://www.worldcubeassociation.org/about"
              underline="hover"
            >
              World Cube Association
            </Link>
            .
          </Typography>
          <Typography gutterBottom>
            Every weekend hundreds of competitors gather at speedcubing
            competitions all around the world. They aim to get podiums, break
            records and outperform their mates, but most importantly to enjoy
            spending time with their friends and meet new members of the
            community. There are up to 17 official events held at every
            competition - the well known 3x3x3 Cube, solved with both hands, one
            hand, blindfolded, but also less known types of puzzles like cubes
            from 2x2x2 up to 7x7x7, a tetrahedron and dodecahedron cubes and
            more!
          </Typography>
          <Typography>
            During the competition WCA Live is the place where the results are
            entered and managed. In every event a competitor waits for his cube
            to be mixed up, then performs each of his official attempts under
            the supervision of a judge (who makes sure all the{' '}
            <Link
              href="https://www.worldcubeassociation.org/regulations/"
              underline="hover"
            >
              WCA rules
            </Link>{' '}
            are fallowed). All attempt results are put down on a piece of paper
            as the competitor does them, then a scoretaker enters them to the
            system to eventually build up competitors ranking for the given
            round. After a competition all the competitor results end up in{' '}
            <Link
              href="https://www.worldcubeassociation.org/results/rankings"
              underline="hover"
            >
              the WCA rankings
            </Link>
            .
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            Get inspired
          </Typography>
          <Typography>
            If you want to get a better feeling of how WCA competitions look and
            the great community around them, there's a great documentary
            available called{' '}
            <Link href="https://youtu.be/1oZY2e25VUw" underline="hover">
              Why We Cube
            </Link>{' '}
            and{' '}
            <Link href="https://youtu.be/DHgC2Ru7_MQ" underline="hover">
              many
            </Link>{' '}
            <Link href="https://youtu.be/8AwlVDT3jo4" underline="hover">
              other
            </Link>{' '}
            <Link href="https://youtu.be/ZSGOVRhYoWU" underline="hover">
              inspiring
            </Link>{' '}
            <Link href="https://youtu.be/sFc-6QNoh8s" underline="hover">
              stories
            </Link>{' '}
            <Link href="https://youtu.be/TOJ2dXahS1Q" underline="hover">
              out
            </Link>{' '}
            <Link href="https://youtu.be/nXuINN-Ah4Y" underline="hover">
              there
            </Link>
            .
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            Technical details
          </Typography>
          <Typography gutterBottom>
            The platform is designed specifically for result management and is
            just a part of the bigger picture. It communicates with other tools
            using{' '}
            <Link
              href="https://github.com/thewca/wcif/blob/master/specification.md"
              underline="hover"
            >
              a standardized format
            </Link>
            , which allows the community to build tiny tools focused on specific
            competition tasks, following the{' '}
            <Link
              href="https://en.wikipedia.org/wiki/Unix_philosophy"
              underline="hover"
            >
              Unix Philosophy
            </Link>
            . See{' '}
            <Link
              href="https://github.com/thewca/wcif/blob/master/vision.md"
              underline="hover"
            >
              this vision document
            </Link>{' '}
            for more details.
          </Typography>
          <Typography gutterBottom>
            WCA Live is an open source project, so feel free to check out the
            specifics on{' '}
            <Link href="https://github.com/thewca/wca-live" underline="hover">
              GitHub
            </Link>
            .
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            Contact
          </Typography>
          <Typography>
            In general prefer to use the{' '}
            <Link
              href="https://www.worldcubeassociation.org/contact/website"
              underline="hover"
            >
              WCA contact form
            </Link>
            , so that your message is directed to the right team. In case of bug
            reports feel free to submit a{' '}
            <Link
              href="https://github.com/thewca/wca-live/issues"
              underline="hover"
            >
              GitHub issue
            </Link>{' '}
            or contact us directly at{' '}
            <Link
              href="mailto:software@worldcubeassociation.org"
              underline="hover"
            >
              software@worldcubeassociation.org
            </Link>
            .
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default About;
